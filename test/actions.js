module( "actions", {
    teardown: moduleTeardown
});

checkGetSet();

asyncTest( "Basic actions", function() {
    var first = jar.Deferred(),
        second = jar.Deferred();

    jar( "Basic actions-1" ).done(function() {
        this.set( "text-type", "text" ).done(function( type, storage ) {
            strictEqual( type, "text", "Data-type should be text" );
            strictEqual( jar.data[ this.name ][ "text-type" ].type, "text", "In meta, data-type should be text" );
            ok( ~jQuery.inArray( storage, jar.order.text ), "Storage should be " + storage );
            strictEqual( jar.data[ this.name ][ "text-type" ].storage, storage, "In meta storage should be " + storage );
        });

        this.set( "json-type", {} ).done(function( type, storage ) {
            strictEqual( type, "json", "Data-type should be json" );
            strictEqual( jar.data[ this.name ][ "json-type" ].type, "json", "In meta data-type should be json" );

            ok( ~jQuery.inArray( storage, jar.order.json ), "Storage should be " + storage );
            strictEqual( jar.data[ this.name ][ "json-type" ].storage, storage, "In meta storage should be " + storage );
        });

        this.promise().done( function() {
            start();
        });
    });

    jar( "Basic actions-2" ).done(function() {
        ok( jar.data[ this.name ], "Meta is initialized" );
        ok( jar.data._meta[ this.name ], "_meta is initialized" );

        this.remove( "not-existed" ).done(function() {
            ok( true, "Prop is not exist but its still is done-callback" );

            this.clear().done(function() {

                ok( jar.data[ this.name ], "Meta is not removed" );
                ok( jar.data._meta[ this.name ], "_meta is not removed" );

                this.remove().done(function() {
                    ok( !jar.data[ this.name ], "Meta is removed" );
                    ok( !jar.data._meta[ this.name ], "_meta is removed" );

                    this.clear().done(function() {
                        second.resolve();
                    });
                });
            });
        });
    });

    jar.when( first, second ).done( start );
});

asyncTest( "Create certain type of storages", 6, function() {
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

                    start();
                });
            });
        });
    });
});

asyncTest( "jar#remove without arguments", function() {
    var def = jar.Deferred();

    jar( "jar#remove without arguments" ).done(function() {
        var original = this.storages.slice().length;

        this.set( "remove it right", "test" ).done(function() {
            this.remove().done(function() {

                equal( original, this.storages.length, "All data stores references is still there" );
                checkRemoved.call( this ).always( start );
            });
        });
    });
});
asyncTest( "jar.destroy", 3, function() {
    jar( "jar.destroy" ).done(function() {
        var store, request, index;

        jar.destroy().done(function() {

            if ( jar.fs.db ) {

                // dot was changed to "_"
                jar.fs.db.getFile( "jar_destroy", {
                    create: false
                }, function( entry ) {
                    ok( false, "Sub dir is still exist" );
                }, function() {
                    ok( true, "Sub dir is destroyed" );
                });
            }

            if ( jar.prefixes.indexedDB ) {

                try {
                    store = jar.idb.db.transaction([ this.name ],
                                            jar.prefixes.IDBTransaction.READ_ONLY !== 0 ? "readonly" : 0 ).objectStore( this.name );
                    index = store.index( "name" );
                    request = index.get( name );

                    ok( false, "Data is still exist" )
                } catch ( _ ) {
                    ok( true, "Data is not still exist" )
                }
            }

            for ( var store in jar.data ) {
                if ( store != "_meta" ) {
                    ok( false, "There is some data left" )
                }
            }

            ok( true, "Meta-data is destroyed" );

            start();
        });
    });
});
