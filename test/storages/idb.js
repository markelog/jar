
function idb() {
    if ( jar.prefixes.indexedDB ) {
        jar.preference( true );

        module( "idb", {
            teardown: moduleTeardown
        });

        asyncTest( "Basic ref",  function() {
            jar( "Basic ref", "idb" ).done(function() {
                ok( this.stores.idb, "idb storage created" );

            }).fail(function() {
                ok( false, "idb storage is not created" );

            }).always( start );
        });

        asyncTest( "Parallel store creation should work", 3, function() {
            var first = jar( "Parallel store creation should work-1", "idb" ).done(function() {
                    ok ( jar.idb.db.objectStoreNames.contains( "Parallel_store_creation_should_work_1" ), "First store is created")
                }),

                second = jar( "Parallel store creation should work-2", "idb" ).done(function() {
                    ok ( jar.idb.db.objectStoreNames.contains( "Parallel_store_creation_should_work_2" ), "Second store is created")
                });

            jar.when( first, second ).done(function() {
                ok( true, "Both stores are created" );
            }).always( start );
        });

        asyncTest( "indexedDB references", 2, function() {
            jar( "indexedDB references", "idb" ).done(function() {
                ok( this.stores.idb, "References for idb store was created" );
                ok( ~this.storages.indexOf( "idb" ), "References in array storages should be present" );
            }).always( start );
        });

        checkGetSet( "idb" );

        asyncTest( "Complete removal of object store", 5, function() {
            var remove = jar.Deferred(),
                checkRemove = jar.Deferred();

            jar( "idb-1", "idb" )
                .done(function() {
                    this.set( "1", "2" ).done(function() {
                        this.get( "1" ).done(function( data ) {
                            this.remove()
                                .done(function() {
                                    ok( !jar.idb.db.objectStoreNames.contains( this.name ), "Store was removed" );

                                    checkRemoved.call( this ).always(function() {
                                        checkRemove.resolve();
                                    })

                                    .always(function() {
                                        ok( !jar.idb.db.objectStoreNames.contains( this.name ), "Store was completely removed" );
                                    });
                                })
                                .fail(function() {
                                    ok( false, "Store was not completely removed" );
                                })
                                .always(function() {
                                    remove.resolve();
                                });
                        });
                    });
                })
                .fail(function() {
                    ok( false, "Can't create object store" );
                });

                jar.when( remove, checkRemove ).always( start );
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

        asyncTest( "Complete removal of object store after it was removed", 5, function() {
            var setup = jar.Deferred(),
                checkRemove = jar.Deferred();

            jar( "idb-3", "idb" ).done(function() {
                this.set( "1", "2" ).done(function() {
                    this.get( "1" ).done(function( data ) {
                        this.remove().done(function() {
                            ok( !jar.idb.db.objectStoreNames.contains( this.name ), "Store was removed" );

                            checkRemoved.call( this ).always(function() {
                                checkRemove.resolve();
                            });

                            this.setup( "idb" )
                                .done(function() {
                                    setup.resolve();

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

            jar.when( setup, checkRemove ).always( function() {
                start();
            });
        });
    }
}

if ( ~window.navigator.userAgent.indexOf( "Firefox" ) ) {
  window.setTimeout( idb, 100 );

} else {
    idb();
}