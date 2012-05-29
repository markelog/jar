!function() {
    jar.log = function( name, storage, type ) {
        this.prefixes.lc[ "jar-type-" + name ] = storage + ":" + type;

    }

    jar.meta = function( name ) {
        var meta = this.prefixes.lc[ "jar-type-" + name ].split( ":" );

        return {
            storage: meta[ 0 ],
            type: meta[ 1 ]
        }
    }

}.call( jar );