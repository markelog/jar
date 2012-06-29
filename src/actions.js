!function () {
    this.set = function( name, data, type ) {
        type = type || jar.type( data );

        var storage,
            reg = this.register(),
            storages = this.order[ type ];

        for ( var i = 0, l = this.order[ type ].length; i < l; i++ ) {
            storage = storages[ i ];

            if ( this[ storages[ i ] ] ) {
                storage = storages[ i ];
                break;
            }
        }

        reg.done(function() {
            this.log( name, storage, type );
        }, this );

        return this[ storage ].set.apply( this, [ name, data, type, reg.id ] );
    };

    this.get = function( name ) {
        var meta = this.meta( name ),
            id = this.register().id;

        if ( meta ) {
            return this[ meta.storage ].get.apply( this, [ name, meta.type, id ] );
        }

        jar.reject( id );
        return this;
    };

    this.remove = function( name ) {

        // If method called without arguments – destroy store
        if ( !arguments.length ) {
            delete this.order;
            return this.clear( true );
        }

        var meta = this.meta( name ),
            reg = this.register(),
            id = reg.id;

        if ( meta && this[ meta.storage ] ) {
            reg.done(function() {
                this.removeRecord( name );
            }, this );

            return this[ meta.storage ].remove.apply( this, [ name, id ] );
        }

        // Make request async
        window.setTimeout(function() {
            jar.resolve( id );
        });

        return this;
    };

    this.clear = function( destroy ) {
        var clear, when,
            data = jar.data[ this.name ],
            def = this.register(),
            defs = [];

        if ( !data._length && !destroy ) {

            // Make request async
            window.setTimeout(function() {
                def.resolve();
            });

            return this;
        }

        for ( var storage in data._storages ) {
            clear = this.register();
            defs.push( clear );

            this[ storage ].clear.apply( this, [ clear.id, destroy ] );
        }

        if ( destroy ) {

            // Remove all meta-info
            when = jar.when.apply( this, defs ).done(function() {
                delete jar.data[ this.name ];
            });
        } else {

            // Save storages meta-info
            when = jar.when.apply( this, defs ).done(function() {
                jar.data[ this.name ] = {
                    _storages: {},
                    _length: 0
                };
            });
        }

        when.done(function() {
            def.resolve();
        }).fail(function() {
            def.reject();
        });

        return this;
    };
}.call( jar.fn );