module( "deferred", {
    teardown: moduleTeardown
});

asyncTest( "Basics", 1, function() {
    var def = jar.Deferred();

    def.fail(function() {
        ok( true, "Fail-callback is called" );
    })
    .done(function() {
        ok( false, "Done-callback should not be called" );
    })
    .always( start );

    def.reject();
})

asyncTest( "jar.when", 12, function() {
    var def1 = jar.Deferred(),
        def2 = jar.Deferred(),
        def3 = jar.Deferred(),
        def4 = jar.Deferred(),
        def5 = jar.Deferred(),
        def6 = jar.Deferred(),
        def7 = jar.Deferred(),
        def8 = jar.Deferred();

    def1.resolve( [ "def1" ] );
    def2.resolve( [ "def2" ] );

    jar.when( def1, def2 ).done(function( def1, def2 ) {
         ok( true, "When worked for resolved Deferred" );
         strictEqual( def1, "def1", "First deferreds arguments is correctly received" );
         strictEqual( def2, "def2", "Second deferreds arguments is correctly received" );
    });

    jar.when.apply( "test", [ def1 ] ).done(function () {
        ok( this.toString() == "test", "If context is explicitly set, when callbacks should execute with it" );
    });

    jar.when().done(function() {
        ok( true, "jar.when called without arguments should be resolved" );
    });

    jar.when( def3, def4 ).always(function() {
        strictEqual( def4.state, "pending", "If one of the deferreds was rejected, call fail-callbacks without waiting for others deferreds" );
    });

    def3.reject();

    jar.when( def5, def6 ).done(function( first, second ) {

        strictEqual( first, "def5", "Callbacks should be execute in sequence they was added" );
        strictEqual( second, "def6", "Callbacks should be execute in sequence they was added" );
    });

    def6.resolve([ "def6" ]);
    def5.resolve([ "def5" ]);

    jar.when( def7, def8 ).always(function() {
        strictEqual( arguments[ 0 ], "def8", "In always callback, for failed deferred, args should be transferrd only for failed callback" );
        strictEqual( arguments.length, 1, "In always callback, for failed deferred, args should be transferrd only for failed callback" );

    }).fail(function() {
        strictEqual( arguments[ 0 ], "def8", "In fail callback, for failed deferred, args should be transferrd only for failed callback" );
        strictEqual( arguments.length, 1, "In fail callback, for failed deferred, args should be transferrd only for failed callback" );
    });

    def7.resolve([ "def7" ]);
    def8.reject([ "def8" ]);

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

    jar.when( exist, notExist ).done(function() {
        start();
    });
});

asyncTest( "jar#done", 7, function() {
    var def = jar.Deferred(),
        test = 0;

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
        strictEqual( test, 0, "Callbacks should be execute in sequence they was added" );
        test = 1;
    }).done(function() {
        strictEqual( test, 1, "Callbacks should be execute in sequence they was added" );
        test = 2;

    }).done(function() {
        strictEqual( test, 2, "Callbacks should be execute in sequence they was added" );
    });

    start();
});

asyncTest( "Storage related deferreds", 4, function() {
    var defs = [];

    defs[ 0 ] = jar( "lc", "lc" ).always(function() {
        ok ( this.active.state !== "pending", "State of a resolved deferred should not be pending" );
    });

    defs[ 1 ] = jar( "lc", "lc" ).always(function() {
        var promise = this.promise()

        promise.done(function() {
            ok ( true, "Done callback for promise method should be executed" );
        });

        strictEqual( promise.resolve, undefined, "Promise object does not have a resolve method" );
        strictEqual( promise.reject, undefined, "Promise object does not have a reject method" );

    });

    jar.when( defs[ 0 ], defs[ 1 ] ).always(function() {
        start();
    });
});