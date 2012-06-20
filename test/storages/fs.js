module( "fs", {
    teardown: moduleTeardown
});

asyncTest( "Complete removal of object store", 3, function() {
    jar( "fs-1", "fs" ).done(function() {
        this.remove()
            .done(function() {
                var name = this.name,
                    self = this;

                jar.fs.db.getDirectory( "fs-1", {}, function() {
                    ok( false, "Store was not removed" );

                    start();
                }, function() {
                    ok( true, "Store was not removed" );

                    strictEqual( jar.data[ name ], undefined, "Meta data about storages was removed for this store" );
                    strictEqual( self.dir, undefined, "Store was removed from jar instance" );

                    start();
                });
            }).fail(function() {
                ok( false, "Store was not removed" );
            });
    });
});

asyncTest( "Clear object store", 3, function() {
    jar( "fs-1", "fs" ).done(function() {
        this.set( "test", "test" ).clear().done(function() {
            var name = this.name;
                self = this;

            this.dir.getFile( "test", {}, function() {
                ok( true, "Data was cleared" );
                strictEqual( jar.data[ name ]._length, 0, "Length of storages was setted to 0" );
                ok( !!self.dir, "Reference still exist" );

                start();
            }, function() {
                ok( false, "Data was not cleared" );
                start();
            });
        }).fail(function() {
            ok( false, "Data was not cleared" );
        })
    });
});

asyncTest( "Parallel store creation should work", 2, function() {
    var fs3active, fs4active;

    fs3active = jar( "fs-3", "fs" ).done(function() {
        ok( true, "First store created" );
    }).fail(function() {
        ok( false, "Second store not created" );
    }).active,

    fs4active = jar( "fs-4", "fs" ).done(function() {
        ok( true, "Second store created" );
    })
    .fail(function() {
        ok( false, "Second store not created" );
    }).active;

    jar.when( fs3active, fs4active ).always(function() {
        start();
    })

});
