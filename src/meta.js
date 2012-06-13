!function() {
    var lc = localStorage;

    this.data = lc[ "jar-meta" ] ? this.filters.json( lc[ "jar-meta" ] ) : {};

    function unload() {
         lc[ "jar-meta" ] = jar.rFilters.json( jar.data );
    }

    if ( window.onbeforeunload ) {
        if ( window.attachEvent ) {
            window.attachEvent( "onbeforeunload", unload );
        } else {
            window.addEventListener( "onbeforeunload", unload, false );
        }
    } else {
        window.history.navigationMode = "compatible";
        window.addEventListener( "unload", unload, false );
    }

    this.log = function( base, name, storage, type ) {
        if ( !this.data[ base ] ) {
            this.data[ base ] = {};
        }

        this.data[ base ][ name ] = {
            storage: storage,
            type: type
        };

        return jar;
    };

    this.meta = function( base, name ) {
        if ( this.data[ base ] ) {
            return this.data[ base ][ name ];
        }
    };

    this.removeRecord = function( base, name ) {
        if ( this.data[ base ] ) {
            delete this.data[ base ][ name ];
        }

        return jar;
    };
}.call( jar );