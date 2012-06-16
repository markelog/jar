!function () {
    this.set = function( name, data, type ) {
        type = type || jar.type( data );

        var storage,
            reg = this.register(),
            storages = this.order[ type ];

        for ( var i = 0, l = storages.length; i < l; i++ ) {
            storage = storages[ i ];

            if ( this.storages[ storage ] && this[ storages[ i ] ] ) {
                storage = storages[ i ];
                break;
            }
        }

        reg.def.done(function() {
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
        var meta = this.meta( name ),
            reg = this.register();

        if ( meta && this[ meta.storage ] ) {
            reg.def.done(function() {
                this.removeRecord( name );
            }, this );

            return this[ meta.storage ].remove.apply( this, [ name, reg.id ] );
        }

        jar.reject( reg.id );
        return this;
    };
}.call( jar.fn );