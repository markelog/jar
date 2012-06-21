!function() {
    var lc = window.localStorage,
        slice = [].slice;

    // Use case for async and sync interfaces should be identical
    // We have to make sync localStorage interface to an async

    function finish( name ) {
        var args = slice.call( arguments );
        args.shift();

        window.setTimeout(function() {
            jar[ name ].apply( jar, args );
        });
    }

    this.lc = function() {
        var def = jar.Deferred();

        // Make sync interface async
        window.setTimeout(function() {
            def.resolve();
        });

        return def;
    };

    this.lc.set = function( name, data, type, id ) {
        try {
            lc[ "jar-value-" + this.name + "-" + name ] = jar.text[ type ]( data );
            finish( "resolve", id );

        } catch ( e ) {
            finish( "reject", id );
        }

        return this;
    };

    this.lc.get = function( name, type, id ) {
        type = type || this.meta( name ).type;

        var data, meta;

        try {
            data = lc[ "jar-value-" + this.name + "-" + name ];

            if ( data !== undefined ) {
                finish( "resolve", id, jar.filters[ type ]( data ), type );

            // If we have no data
            } else {
                finish( "reject", id );
            }
        } catch ( e ) {
            finish( "reject", id );
        }

        return this;
    };

    this.lc.remove = function( name, id ) {
        try {
            lc.removeItem( "jar-value-" + this.name + "-" + name );
            finish( "resolve", id );

        } catch ( e ) {
            finish( "reject", id );
        }

        return this;
    };

    this.lc.clear = function( id, destroy /* internal */ ) {
        var reg,
            self = this,
            defs = [],
            data = jar.data[ this.name ];

        function exec( key ) {
            return function() {
                this.removeRecord( key );
            };
        }

        for ( var key in data ) {
            reg = this.register();
            defs.push( reg );

            this[ data[ key ].storage ].remove.apply( this, [ key, reg.id ] );

            reg.done( exec( key ), this );
        }

        jar.when.apply( this, defs ).fail(function() {
            jar.reject( id );
        });

        return this;
    };
}.call( jar.fn );