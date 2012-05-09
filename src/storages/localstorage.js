!function() {
    var lc = localStorage;

    this.lc = {
        set: function( name, data, type ) {
            var type = type || jar.type( data );

            try {
                jar.log( name, "lc", type );
                lc[ "jar-value-" + name ] = jar.rFilters[ type ]( data );

            } catch ( e ) {}

            this.active.resolve( [ data ] );

            return this;
        },

        get: function( name, type ) {
            type = type || jar.meta( name ).type;

            var data, meta;

            try {
                data = lc[ "jar-value-" + name ];

                this.active.resolve( [ jar.filters[ type ]( data ) ] );
            } catch ( e ) {}

            return this;
        },

        remove: function( name ) {
            try {
                lc.removeItem( name );
                this.active.resolve( [ jar.filters[ type ]( data ) ] );
            } catch ( e ) {
                this.active.reject();
            }

            return this;
        }
    }

}.call( jar );