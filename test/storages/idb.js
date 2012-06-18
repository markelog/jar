module( "idb", {
    teardown: moduleTeardown
});

asyncTest( "Complete removal of object store", 1, function() {
    jar( "idb-1", "idb" )
        .done(function() {
            this.set( "1", "2" ).done(function() {
                this.get( "1" ).done(function( data ) {
                    this.remove()
                        .done(function() {
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
            start();
            ok( false, "Can't create object store" );
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
                    start();
                    ok( false, "Store was not cleared" );
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
                })
            });
        });
    });
});

asyncTest( "Parallel store creation should work", 2, function() {
    jar( "idb-1", "idb" ).done(function() {
        ok( true, "First store created" );
    });

    jar( "idb-2", "idb" ).done(function() {
        ok( true, "Second store created" );
        start();
    });
});