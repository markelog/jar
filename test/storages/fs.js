if ( jar.prefixes.storageInfo ) {
    module( "fs", {
        teardown: moduleTeardown
    });

    asyncTest( "Basic ref", 2, function() {
        jar().done(function() {
            ok( this.stores.fs, "fs storage created" );

            this.set( "a/a/", "test" ).done(function() {
                this.get( "a/a/" ).done(function( data ) {
                    strictEqual( data, "test", 'We can store files with symbol "/" in their names' );
                    start();
                });
            });
        });
    });

    asyncTest( "Filesystem references", 2, function() {
        jar( "Filesystem references", "fs" ).done(function() {
            ok( this.stores.fs.sub, "References for fs store was created" );
            ok( ~this.storages.indexOf( "fs" ), "References in array storages should be present" );

            start();
        });
    });

    checkGetSet( "fs" );

    asyncTest( "Complete removal of object store", 7, function() {
        jar( "fs-1", "fs" ).done(function() {
            var store = this.stores.fs.sub;

            this.remove()
                .done(function() {
                    var name = this.name,
                        self = this;

                    store.getDirectory( "fs-1", {}, function() {
                        ok( false, "Store was not removed" );

                        start();
                    }, function() {
                        ok( true, "Store was not removed" );

                        strictEqual( jar.data._meta[ name ], undefined, "Meta data about storages was removed for this store" );
                        ok( self.stores.fs, "Store was not removed from jar instance" );
                        ok( self.stores.fs.sub, "Sub-dir was removed" );

                        checkRemoved.call( self ).always( start );
                    });
                }).fail(function() {
                    ok( false, "Store was not removed" );
                });
        });
    });

    asyncTest( "Clear object store", 3, function() {
        jar( "fs-1", "fs" ).done(function() {
            this.set( "test", "test" ).done(function() {
                this.clear().done(function() {
                    var name = this.name,
                        self = this;

                    this.stores.fs.sub.getFile( "test", {}, function() {
                        ok( false, "Data was not cleared" );
                        start();

                    }, function() {
                        ok( true, "Data was cleared" );
                        strictEqual( jar.data._meta[ name ].length, 0, "Length of storages was setted to 0" );
                        ok( !!self.stores.fs, "Reference still exist" );

                        start();
                    });
                }).fail(function() {
                    ok( false, "Data was not cleared" );
                });
            });
        });
    });


    asyncTest( "Parallel store creation should work", 2, function() {
        var fs3active, fs4active;

        fs3active = jar( "Parallel store creation should work-1", "fs" ).done(function() {
            ok( true, "First store created" );

        }).fail(function() {
            ok( false, "Second store not created" );

        }).active;

        fs4active = jar( "Parallel store creation should work-2", "fs" ).done(function() {
            ok( true, "Second store created" );
        })
        .fail(function() {
            ok( false, "Second store not created" );
        }).active;

        jar.when( fs3active, fs4active ).always(function() {
            start();
        });
    });
}

