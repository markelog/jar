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
                            console.log( this.instances.idb.db.objectStoreNames )
                            ok( !~[].indexOf.call( this.instances.idb.db.objectStoreNames, "idb-1" ), "Store was completely removed" );
                        })
                        .fail(function() {
                            ok( false, "Store was not completely removed" );
                        })
                        .always( start );
                });
            });
        })
        .fail(function() {
            console.log(4)
        })
});

asyncTest( "Clear object store", 2, function() {
    var test = jar( "idb-2", "idb" ).done(function() {
        this.set( "1", "2" ).done(function() {
            this.get( "1" ).done(function( data ) {
                this.clear()
                    .done(function() {
                        ok( test.instances.idb.db.objectStoreNames.length === 1, "Store was cleared" );
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
    var test = jar( "idb-3", "idb" ).done(function() {
        this.set( "1", "2" ).done(function() {
            this.get( "1" ).done(function( data ) {
                this.remove().done(function() {
                    this.setup( "idb" )
                        .done(function() {
                            ok( test.instances.idb.db.objectStoreNames.length === 1, "Store was setted, after being removed" );
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
