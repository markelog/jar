!function () {
    this.get = function( name ) {
        var meta = jar.meta( name );

        return jar[ meta.storage ].get.apply( this, [ name, meta.type ] );
    };

    this.set = function( name, data ) {
        var storage,
            storages = this.types[ jar.type( data ) ];

        this.active = jar.Deferred();

        for ( var i = 0, l = storages.length; i < l; i++ ) {
            if ( jar[ storages[ i ] ] ) {
                break;
            }
        }

        return jar[ storages[ i ] ].set.apply( this, arguments );
    };

    this.done = function( fn, context ) {
        this.active.add( "done", fn, context );
        return this;
    }

    this.fail = function( fn, context ) {
        this.active.add( "fail", fn, context );
        return this;
    }

    this.always = function( fn, context ) {
        this.active.add( "always", fn, context );
        return this;
    }

}.call( jar.fn );