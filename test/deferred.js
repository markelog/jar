module( "deferred", {
    teardown: moduleTeardown
});

asyncTest( "jar.when", 4, function() {
    var def1 = jar.Deferred(),
        def2 = jar.Deferred(),
        def3 = jar.Deferred(),
        def4 = jar.Deferred();

    def1.resolve();
    def2.resolve();

    jar.when( def1, def2 ).done(function() {
         ok( true, "When worked for resolved Deferred" );
    });

    jar.when.apply( "test", [ def1 ] ).done(function () {
        ok( this.toString() == "test", "If context is explicitly set, when callbacks should execute with it" );
    });

    jar.when().done(function() {
        ok( true, "jar.when called without arguments should be resolved")
    });

    jar.when( def3, def4 ).always(function() {
        strictEqual( def4.state, "pending", "If one of the deferreds was rejected, call fail-callbacks without waiting for others deferreds" );
    });

    def3.reject();

    start();
});

asyncTest( "jar.Deferred#then", 4, function() {
    var def1 = jar.Deferred(),
        def2 = jar.Deferred(),
        exist = jar.Deferred(),
        notExist = jar.Deferred();

    def1.then(function() {
        ok( true, "Successful callback is executed" );
    });

    def2.then(function() {
        ok( false, "Successful callback should not be executed" );

    }, function() {
        ok( true, "Unsuccessful callback is executed" );
    });

    def1.resolve();
    def2.reject();

    jar( "not-existed" ).get( "not-existed" ).then(function() {
        ok( false, "Then successful callback should not be executed" );

    }, function() {
        ok( true, "Unsuccessful callback should be executed" );

        notExist.resolve();
    });

    jar( "exist" ).done(function() {
        this.set( "exist", "test" ).done(function() {
            this.get( "exist" ).then(function() {
                ok( true, "Successful callback is executed" );

            }).always(function() {
                exist.resolve();
            });
        });
    });

    jar.when( exist, notExist ).done( start );
});

asyncTest( "jar#done", 4, function() {
    var def = jar.Deferred();

    def.done(function() {
        ok( true, "Simple done-callback" );
    }).fail(function() {
        ok( false, "Fail-callback should be called for successful Deferred" );
    }).always(function() {
        ok( true, "Always-callback should be always called" );
    })

    def.resolve();

    def = jar.Deferred();
    def.done(function() {
        ok( this.toString() == "bla" , "Context resolved correctly" );
    }, "bla" );

    def.resolve();

    def.done(function() {
        ok( true , "Resolved deferred was executed" );
    });

    start();
});

asyncTest( "Storage related deferreds", 2, function() {
    var defs = [];

    defs[ 0 ] = jar( "lc", "lc" ).always(function() {
        ok ( this.active.state !== "pending", "State of a resolved deferred should not be pending" );
    }).active;

    defs[ 1 ] = jar( "lc", "lc" ).always(function() {
        this.promise().done(function() {
            ok ( true, "Done callback for promise method should be executed" );
        });
    }).active;

    jar.when( defs[ 0 ], defs[ 1 ] ).always(function() {
        start();
    });
});