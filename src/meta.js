!function() {
    var lc = localStorage,
        data = lc[ "jar-meta" ];

    jar.data = data ? jar.filters.json( data ) : {};

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

    // Log meta-data
    this.log = function( name, storage, type ) {
        var data;

        if ( !jar.data[ this.name ] ) {
            jar.data[ this.name ] = {

                // Possible vulnerable
                _storages: {},

                _length: 0
            };
        }

        data = jar.data[ this.name ];

        // Check for name if we have to only initiate storage
        if ( storage ) {
            data[ name ] = {
                storage: storage,
                type: type
            };

            data._length++;
        } else {
            storage = name;
        }

        // Remember total amounts of keys that uses this type of storages
        if ( !data._storages[ storage ] ) {
            data._storages[ storage ] = 0;
        }

        data._storages[ storage ]++;

        return this;
    };

    // Remove meta-data
    this.removeRecord = function( name ) {
        var storage,
            meta = jar.data[ this.name ];

        if ( !data ) {
            return this;
        }

        storage = data._storages;

        delete data[ name ];

        // If data is equal to zero we still no removing data-store
        data._length--;

        // But we remove info about storages
        if ( !--data._storages[ storage ] ) {
            delete data._storages[ storage ];
        }

        return this;
    };

    // Get meta-data
    this.meta = function( name ) {
        var data;

        if ( data = jar.data[ this.name ] ) {
            return data[ name ];
        }
    };
}.call( jar.fn );