module( "fs", {
    teardown: moduleTeardown
});

asyncTest( "Complete removal of object store", 2, function() {
    var test = jar( "test-1", "fs" ).done(function() {
        this.set( "1", "2" ).done(function() {
            this.get( "1" ).done(function( data ) {
                this.remove()
                    .done(function() {
                        ok( !test.instances.fs.db.objectStoreNames.length, "Store was completely removed" );
                    })
                    .fail(function() {
                        ok( false, "Store was not completely removed" );
                    })
                    .always( start );
            });
        });
    });
});

asyncTest( "Clear object store", 2, function() {
    var test = jar( "test-1", "fs" ).done(function() {
        this.set( "1", "2" ).done(function() {
            this.get( "1" ).done(function( data ) {
                this.clear()
                    .done(function() {
                        ok( test.instances.fs.db.objectStoreNames.length === 1, "Store was cleared" );
                    })
                    .fail(function() {
                        ok( false, "Store was not cleared" );
                    })
                    .always( start );
            });
        });
    });
});

asyncTest( "Complete removal of object store", 1, function() {
    var test = jar( "test-1", "fs" ).done(function() {
        this.set( "1", "2" ).done(function() {
            this.get( "1" ).done(function( data ) {
                this.remove().done(function() {
                    this.setup( "fs" )
                        .done(function() {
                            ok( test.instances.fs.db.objectStoreNames.length === 1, "Store was setted, after being removed" );
                            start();
                        })
                        .fail(function() {
                            ok( false, "Store was not setted, after being removed" );
                        })
                        .always( start );
                });
            });
        });
    });
});
