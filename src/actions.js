!function () {
    var push = [].push;

    this.get = function( name ) {
        var meta = jar.meta( this.name, name );

        if ( meta ) {
            return this[ meta.storage ].get.apply( this, [ name, meta.type ] );
        }

        jar.reject( this.register() );
        return this;
    };

    this.set = function( name, data, type ) {
        var storage,
            type = type || jar.type( data ),
            storages = this.types[ type ];

        push.call( arguments, type )

        for ( var i = 0, l = storages.length; i < l; i++ ) {
            if ( this[ storages[ i ] ] ) {
                storage = storages[ i ];
                break;
            }
        }
        return this[ storage ].set.apply( this, arguments );
    };

    this.remove = function( name ) {
        var meta = jar.meta( this.name, name );

        if ( meta ) {
            return this[ meta.storage ].remove.apply( this, [ name ] );
        }

        jar.reject( this.register() );
        return this;
    };

}.call( jar.fn );