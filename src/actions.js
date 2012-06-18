!function () {
    this.set = function( name, data, type ) {
        type = type || jar.type( data );

        var storage,
            reg = this.register(),
            storages = this.order[ type ];

        for ( var i = 0, l = storages.length; i < l; i++ ) {
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
        var data = jar.data[ this.name ],
            def = this.register();

        if ( !data ) {

            // Make request async
            window.setTimeout(function() {
                def.resolve();
            });
            return this;
        }

        for ( var key in data ) {
            this[ data[ key ].storage ].clear.apply( this, [ def.id, destroy ] );
        }

        if ( destroy ) {
            def.done(function() {
                delete jar.data[ this.name ];
            });
        }

        return this;
    };
}.call( jar.fn );