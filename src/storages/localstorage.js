!function() {
    var lc = localStorage;

    this.lc = {
        set: function( name, data, type ) {
            type = type || jar.type( data );

            var id = this.registr();

            try {

                // Залогируй мета информацию
                jar.log( name, "lc", type );
                lc[ "jar-value-" + name ] = jar.rFilters[ type ]( data );

                jar.resolve( id );

            } catch ( e ) {
                jar.reject( id );
            }

            return this;
        },

        get: function( name, type ) {
            type = type || jar.meta( name ).type;

            var data, meta,
                id = this.registr();

            try {
                data = lc[ "jar-value-" + name ];
                jar.resolve( id, jar.filters[ type ]( data ) );

            } catch ( e ) {
                jar.reject( id );
            }

            return this;
        },

        remove: function( name ) {
            var id = this.registr();

            try {

                lc.removeItem( "jar-value-" + name );
                jar.removeRecord( name );
                jar.resolve( id, jar.filters[ type ]( data ) );

            } catch ( e ) {
                jar.reject( id );
            }

            return this;
        }
    }

}.call( jar );