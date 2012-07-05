!function () {
    this.set = function( name, data, type ) {
        type = type || jar.type( data );

        var storage, storages,
            reg = this.register();

        // Reject request if storage is not exist
        if ( !this.order ) {
            setTimeout(function() {
                reg.reject();
            });

            return this;
        }

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
        } else {

            // Make request async
            window.setTimeout(function() {
                jar.reject( id );
            });

            return this;
        }

        // Make request async
        window.setTimeout(function() {
            jar.resolve( id );
        });

        return this;
    };

    this.clear = function( destroy ) {
        var clear, when, def,
            self = this,
            name = this.name
            data = jar.data[ name ],
            meta = jar.data._meta[ name ],
            defs = [];

        if ( !meta.length ) {
            def = this.register();

            // Make request async
            window.setTimeout(function() {
                if ( destroy ) {
                    kill( name );
                }

                jar.resolve( def );
            });

            return this;
        }

        for ( var storage in meta.storages ) {
            clear = this.register();
            defs.push( clear );

            this[ storage ].clear.apply( this, [ clear.id, destroy ] );
        }

        if ( destroy ) {

            // Remove all meta-info
            when = jar.when.apply( this, defs ).done(function() {
                kill( name );
            });

        } else {

            // Save storages meta-info
            when = jar.when.apply( this, defs ).done(function() {
                jar.data._meta[ name ] = {
                    storages: {},
                    length: 0
                };
            });
        }

        def = this.register();

        when.done(function() {
            def.resolve();

        }).fail(function() {
            def.reject();
        });

        return this;
    };

    function kill( name ) {
        delete jar.data[ name ];
        delete jar.data._meta[ name ];
    }

}.call( jar.fn );