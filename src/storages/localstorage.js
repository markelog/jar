!function() {
    var lc = window.localStorage;

    this.lc = {
        set: function( name, data, type, id ) {
            try {
                lc[ "jar-value-" + this.name + "-" + name ] = jar.serializations[ type ]( data );
                jar.resolve( id );

            } catch ( e ) {
                jar.reject( id );
            }

            return this;
        },

        get: function( name, type, id ) {
            type = type || this.meta( name ).type;

            var data, meta;

            try {
                data = lc[ "jar-value-" + this.name + "-" + name ];
                if ( data ) {
                    jar.resolve( id, jar.filters[ type ]( data ), type );
                } else {
                    jar.reject( id );
                }
            } catch ( e ) {
                jar.reject( id );
            }

            return this;
        },

        remove: function( name, id ) {
            try {
                lc.removeItem( "jar-value-" + this.name + "-" + name );
                jar.resolve( id );

            } catch ( e ) {
                jar.reject( id );
            }

            return this;
        }
    };
}.call( jar.fn );