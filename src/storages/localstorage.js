!function() {
    var lc = window.localStorage;

    this.lc = {
        set: function( name, data, type ) {
            type = type || jar.type( data );

            var id = this.register();

            try {
                lc[ "jar-value-" + this.name + "-" + name ] = jar.rFilters[ type ]( data );
                jar.log( this.name, name, "lc", type );
                jar.resolve( id );

            } catch ( e ) {
                jar.reject( id );
            }

            return this;
        },

        get: function( name, type ) {
            type = type || jar.meta( this.name, name ).type;

            var data, meta,
                id = this.register();

            try {
                data = lc[ "jar-value-" + this.name + "-" + name ];
                jar.resolve( id, jar.filters[ type ]( data ), type  );

            } catch ( e ) {
                jar.reject( id );
            }

            return this;
        },

        remove: function( name ) {
            var id = this.register();

            try {
                lc.removeItem( "jar-value-" + this.name + "-" + name );
                jar.removeRecord( this.name, name );
                jar.resolve( id );

            } catch ( e ) {
                jar.reject( id );
            }

            return this;
        }
    };
}.call( jar );