if ( jar.prefixes.indexedDB) {
    module( "idb", {
        teardown: moduleTeardown,
    });

    asyncTest( "Basic ref", 1, function() {
        jar().done(function() {
            ok( this.stores.idb, "idb storage created" );

            start();
        });
    });

    asyncTest( "Parallel store creation should work", 2, function() {
        jar( "idb-1", "idb" ).done(function() {
            ok( true, "First store created" );
        });

        jar( "idb-2", "idb" ).done(function() {
            ok( true, "Second store created" );

            // Assuming this request will be the last one
            start();
        });
    });

    asyncTest( "indexedDB references", 2, function() {
        jar( "indexedDB references", "idb" ).done(function() {
            ok( this.stores.idb, "References for idb store was created" );
            ok( ~this.storages.indexOf( "idb" ), "References in array storages should be present" );

            start();
        });
    });

    checkGetSet( "idb" );

    asyncTest( "Complete removal of object store", 4, function() {
        jar( "idb-1", "idb" )
            .done(function() {
                this.set( "1", "2" ).done(function() {
                    this.get( "1" ).done(function( data ) {
                        this.remove()
                            .done(function() {
                                checkRemoved.call( this );

                                ok( !~[].indexOf.call( jar.idb.db.objectStoreNames, this.name ), "Store was completely removed" );
                            })
                            .fail(function() {
                                ok( false, "Store was not completely removed" );
                            })
                            .always( start );
                    });
                });
            })
            .fail(function() {
                ok( false, "Can't create object store" );
                start();
            });
    });

    asyncTest( "Clear object store", 1, function() {
        jar( "idb-2", "idb" ).done(function() {
            this.set( "1", "2" ).done(function() {
                this.clear()
                    .done(function() {
                        this.get( "1" )
                            .done(function() {
                                ok( false, "Data was not cleared" );
                            })
                            .fail(function() {
                                ok( true, "Data was cleared" );
                            })
                            .always( start );
                    })
                    .fail(function() {
                        ok( false, "Store was not cleared" );
                        start();
                    });
            });
        });
    });

    asyncTest( "Complete removal of object store after it was removed", 1, function() {
        jar( "idb-3", "idb" ).done(function() {
            this.set( "1", "2" ).done(function() {
                this.get( "1" ).done(function( data ) {
                    this.remove().done(function() {
                        this.setup( "idb" )
                            .done(function() {
                                ok( jar.idb.db.objectStoreNames.contains( this.name ), "Store was setted, after being removed" );
                            })
                            .fail(function() {
                                ok( false, "Store was not setted, after being removed" );
                            })
                            .always( start );
                    }).fail(function() {
                        ok( false, "Store was not removed" );
                        start();
                    })
                });
            });
        });
    });
}