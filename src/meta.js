!function() {

    this.log = function( name, storage, type ) {
        this.prefixes.lc[ "jar-type-" + name ] = storage + ":" + type;
    }

    this.meta = function( name ) {
        var meta = this.prefixes.lc[ "jar-type-" + name ].split( ":" );

        return {
            storage: meta[ 0 ],
            type: meta[ 1 ]
        }
    }

    this.removeRecord = function( name ) {
        this.prefixes.lc.removeItem( "jar-type-" + name );
    }
}.call( jar );