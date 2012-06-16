!function() {
    var lc = localStorage,
        data = lc[ "jar-meta" ];

    jar.data = !!data ? jar.filters.json( data ) : {};

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

    this.log = function( name, storage, type ) {
        if ( !jar.data[ this.name ] ) {
            jar.data[ this.name ] = 1;
        }

        jar.data[ this.name ][ name ] = {
            storage: storage,
            type: type
        };

        return jar;
    };

    this.meta = function( name ) {
        if ( jar.data[ this.name ] ) {
            return jar.data[ this.name ][ name ];
        }
    };

    this.removeRecord = function( name ) {
        if ( jar.data[ this.name ] ) {
            delete jar.data[ this.name ][ name ];
        }

        return jar;
    };
}.call( jar.fn );