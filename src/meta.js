!function() {
    var test,
        data = {},
        lc = window.localStorage;

    if ( !( jar.support = !!jar.text.json ) || !lc ) {
        return;
    }

    try {
        test = lc[ "test" ];
        lc.setItem( "test", "test" );

        if ( test ) {
            lc.test = test;

        } else {
            lc.removeItem( "test" );
        }

        data = lc[ "jar-meta" ];
        jar.iversion = lc[ "jar-iversion" ];

        // IE10 wtf? This will not work – lc[ "jar-iversion" ] || 1
        jar.iversion = +lc[ "jar-iversion" ] || 1;

    } catch ( _ ) {}

    jar.data = data = data ? jar.filters.json( data ) : {};

    if ( !data._meta ) {
        data._meta = {};
    }

    function unload() {
        try {
            lc[ "jar-meta" ] = jar.text.json( jar.data );
            lc[ "jar-iversion" ] = jar.iversion;
        } catch ( _ ) {}
    }

    if ( window.onbeforeunload == null ) {
        if ( window.addEventListener ) {
            window.addEventListener( "beforeunload", unload, false );
        } else {
            window.attachEvent( "beforeunload", unload );
        }
    }

    // Log meta-data
    this.log = function( name, storage, type ) {
        var data, meta;

        if ( !jar.data._meta[ this.name ] ) {
            jar.data[ this.name ] = {};

            jar.data._meta[ this.name ] = {
                storages: {},
                length: 0
            };
        }

        meta = jar.data._meta[ this.name ];
        data = jar.data[ this.name ];

        // Check for name if we have to only initiate storage
        if ( storage ) {
            data[ name ] = {
                storage: storage,
                type: type
            };

        } else {
            storage = name;
        }

        // Remember total amounts of keys that uses this type of storages
        if ( !meta.storages[ storage ] ) {
            meta.storages[ storage ] = 0;
        }

        meta.length++;
        meta.storages[ storage ]++;

        return this;
    };

    // Remove meta-data
    this.removeRecord = function( name ) {
        var storage,
            data = jar.data[ this.name ],
            meta = jar.data._meta[ this.name ];

        if ( !data ) {
            return this;
        }

        storage = meta.storages;

        delete data[ name ];

        // If data is equal to zero we still no removing data-store
        meta.length--;

        // But we remove info about storages
        if ( !--meta.storages[ storage ] ) {
            delete meta.storages[ storage ];
        }

        return this;
    };

    // Get meta-data
    this.meta = function( name, base /* internal */ ) {
        var data;
        if ( data = jar.data[ base || this.name ] ) {
            return data[ name ];
        }
    };
}.call( jar.fn );