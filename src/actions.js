!function () {
    this.get = function( name ) {
        var meta = jar.meta( this.name, name );

        if ( meta ) {
            return jar[ meta.storage ].get.apply( this, [ name, meta.type ] );
        }

        jar.reject( this.register() );
        return this;
    };

    this.set = function( name, data ) {
        var storage,
            type = jar.type( data ),
            storages = this.types[ type ];

        for ( var i = 0, l = storages.length; i < l; i++ ) {
            if ( jar[ storages[ i ] ] ) {
                storage = storages[ i ];
                break;
            }
        }

        return jar[ storage ].set.apply( this, arguments );
    };

    this.remove = function( name ) {
        var meta = jar.meta( this.name, name );

        if ( meta ) {
            return jar[ meta.storage ].remove.apply( this, [ name ] );
        }

        jar.reject( this.register() );
        return this;
    };

}.call( jar.fn );