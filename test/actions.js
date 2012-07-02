module( "actions", {
    teardown: moduleTeardown
});

asyncTest( "Check get and set methods", 57, function() {
    jar().done(function() {
        checkGetSet.call( this );
    });
});

asyncTest( "Basic actions", 8, function() {
    jar().done(function() {
        this.set( "text-type" ).done(function( type, storage ) {
            strictEqual( type, "text", "Data-type should be text" );
            strictEqual( jar.data.jar[ "text-type" ].type, "text", "In meta data-type should be text " );

            strictEqual( jar.order.text[ 0 ], storage, "Storage should be " + storage );
            strictEqual( jar.data.jar[ "text-type" ].storage, storage, "In meta storage should be " + storage );
        });

        this.set( "json-type", {} ).done(function( type, storage ) {
            strictEqual( type, "json", "Data-type should be json" );
            strictEqual( jar.data.jar[ "json-type" ].type, "json", "In meta data-type should be json" );

            strictEqual( jar.order.text[ 0 ], storage, "Storage should be " + storage );
            strictEqual( jar.data.jar[ "json-type" ].storage, storage, "In meta storage should be " + storage );
        });

        this.promise().done( start );
    });
});

asyncTest( "Create certain type of storages", 6, function() {
    var def = jar.Deferred();

    jar( "test", "idb" ).done(function() {
        strictEqual( this.storages[ 0 ], "idb", "Create only idb type of storage" );

        jar( "test", "fs" ).done(function() {
            strictEqual( this.storages[ 0 ], "fs", "Create only fs type of storage" );

            jar( "test", "lc" ).done(function() {
                strictEqual( this.storages[ 0 ], "lc", "Create only lc type of storage" );

                jar( "test", "idb fs lc" ).done(function() {

                    strictEqual( this.storages[ 0 ], "idb", "Create idb type of storage" );
                    strictEqual( this.storages[ 1 ], "fs", "Create fs type of storage" );
                    strictEqual( this.storages[ 2 ], "lc", "Create lc type of storage" );

                    def.resolve();

                    start();
                });
            });
        });
    });
});

asyncTest( "jar#remove without arguments", 4, function() {
    var def = jar.Deferred();

    jar( "jar#remove without arguments" ).done(function() {
        this.set( "clear it right", "test" ).done(function() {
            this.remove().done(function() {
                var stores = this.stores,
                    okey = false;

                this.storages.forEach(function( name ) {
                    if ( name != "lc" && !okey ) {
                        okey = stores[ name ];
                    }
                });

                ok( okey, "All data stores references is still there" );
                checkRemoved.call( this ).promise().always( start );
            });
        });
    });
});
