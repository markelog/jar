module( "load", { teardown: moduleTeardown } );

var origin = "//" + window.location.host + window.location.pathname;


asyncTest( "Load js as text and executed after", 2, function() {
    function testit() {
        var first, second;

        first = jar.load( origin + "data/stepinit.js",
            "Load js as text and executed after",
            "text");

        second = jar.load( origin + "data/step.js",
                "Load js as text and executed after",
                "text");

        jar.when( first, second ).done(function() {
            for ( var i = 0, l = arguments.length; i < l; i++ ) {
                jar.filters.js( arguments[ i ] );
            }

            ok( step, "Variable is defined" );

            // cleanup
            window.step = undefined;
        });
    }

    jar( "Load js as text and executed after" ).done(function() {
        this.remove()

            // through xhr-request
            .done( testit )

            // through jar-store
            .done( testit )

            .done(function() {
                setTimeout(function() {
                    start();
                }, 100 );
            });
    });
});


asyncTest( "jar.load - if we fail to load data that we have – make xhr", function() {
    var path = origin + "data/data.js",
        data = {},
        name = "jar.load - if we fail to load data that we have – make xhr";

    data[ path ] = { "storage": jar.order.js[ 0 ], "type": "js" };

    jar( name ).done(function() {
        var name = this.name;

        // let's pretend we have data
        jar.data[ name ] = data;
        jar.data._meta[ name ] = { "storages": { "idb":1,"fs":1,"lc":1,"sql":2 }, "length":1 };

        // when actually we don't
        jar.load( path, name ).done(function( info ) {
            ok( window.js, "We get our data even when don't have it in the first place" );

            // cleanup
            window.js = undefined;

            // now lets pretend we have data and url is valid
            path = "test.js";
            jar.data[ name ][ path ] = { "storage": jar.order.js[ 0 ], "type": "js" };
            jar.data._meta[ name ] = { "storages": { "idb":1,"fs":1,"lc":1,"sql":2 }, "length":1 };

            jar.load( path, name ).fail(function() {
                ok( true, "This request should fail" );
                start();
            });
        });

    });
});

