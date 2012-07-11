if ( window.openDatabase ) {
    module( "sql", {
        teardown: moduleTeardown
    });

    asyncTest( "Basic ref", 1, function() {
        jar().done(function() {
            ok( this.stores.sql, "sql storage created" );
            start();
        });
    });

    asyncTest( "WebSQL references", 2, function() {
        jar( "WebSQL references", "sql" ).done(function() {
            ok( this.stores.sql, "References for WebSQL store was created" );
            ok( ~this.storages.indexOf( "sql" ), "References in array storages should be present" );

            start();
        });
    });

    checkGetSet( "sql" );

    asyncTest( "Check specific to sql storage actions", 2, function() {
        jar( "sql-rewrite@_#t", "sql" ).done(function() {
            this.set( "test", "test1" ).done(function() {
                this.get( "test" ).done(function( data ) {
                    strictEqual( data, "test1", "Initial data is correct" );

                    this.set( "test", "test2" ).done(function() {
                        this.get( "test" ).done(function( data ) {
                            strictEqual( data, "test2", "Initial data is changed" );

                            start();
                        });
                    });
                })
            });
        }).fail(function() {
            ok( false, "We can create table with name with not alphabetical symbols" );
        });
    });


    asyncTest( "Complete removal of object store", 1, function() {
        jar( "sql-1", "sql" )
            .done(function() {
                this.set( "1", "2" ).done(function() {
                    this.get( "1" ).done(function( data ) {
                        this.remove()
                            .done(function() {
                                ok( this.stores.sql, "References to database is still there" );
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
        jar( "sql-2", "sql" ).done(function() {
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

    asyncTest( "Parallel store creation should work", 2, function() {
        jar( "sql-1", "sql" ).done(function() {
            ok( true, "First store created" );
        });

        jar( "sql-2", "sql" ).done(function() {
            ok( true, "Second store created" );

            // Assuming this request will be the last one
            start();
        });
    });
}