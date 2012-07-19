module( "load", { teardown: moduleTeardown } );

var origin = "//" + window.location.host + window.location.pathname;

asyncTest( "jar.load - js", function() {
    var path = origin + "data/data.js";

    jar( "jar.load - js" ).done(function() {
        this.clear().done(function() {

            // through xhr-request
            jar.load( path, "jar.load - js" ).done(function( data, base ) {
                ok( data.length, "Data is returned" );
                ok( js, "Variable is assigned" );

                // cleanup
                window.js = undefined;

                // wait a bit, so data can be writed
                window.setTimeout(function() {
                    ok( jar.has( "jar.load - js", path ), "Meta-data should be intializated" );

                    // through jar-store
                    jar.load( path, "jar.load - js" ).done(function( data, base ) {
                        ok( data.length, "Data is returned" );
                        ok( js, "Variable is assigned" );

                        // cleanup
                        window.js = undefined;

                        start();
                    });
                }, 100 );
            });
        });
    });
});

asyncTest( "jar.load - xml", function() {
    var path = origin + "data/data.xml";

    jar( "jar.load - xml" ).done(function() {
        this.clear().done(function() {

            // through xhr-request
            jar.load( path, "jar.load - xml" ).done(function( data, base ) {
                strictEqual( jar.type( data ), "xml", "Data is returned" );

                // wait a bit, so data can be writed
                window.setTimeout(function() {
                    ok( jar.has( "jar.load - xml", path ), "Meta-data should be intializated" );

                    // through jar-store
                    jar.load( path, "jar.load - xml" ).done(function( data, base ) {
                        strictEqual( jar.type( data ), "xml", "Data is returned" );

                        start();
                    });
                }, 100 );
            });
        });
    });
});

asyncTest( "jar.load - xsl", function() {
    var path = origin + "data/data.xsl";

    jar( "jar.load - xsl" ).done(function() {
        this.clear().done(function() {

            // through xhr-request
            jar.load( path, "jar.load - xsl" ).done(function( data, base ) {
                strictEqual( jar.type( data ), "xml", "Data is returned" );

                // wait a bit, so data can be writed
                window.setTimeout(function() {
                    ok( jar.has( "jar.load - xsl", path ), "Meta-data should be intializated" );

                    // through jar-store
                    jar.load( path, "jar.load - xsl" ).done(function( data, base ) {
                        strictEqual( jar.type( data ), "xml", "Data is returned" );

                        start();
                    });
                }, 100 );
            });
        });
    });
});

asyncTest( "Explicitly set data-type",  function() {
    var css, jsType, xml, wrongType;

    css = jar.load( origin + "data/data.css",
                                "jar.load, explicetlly set data-type", "css" ).done(function() {
        var element = jQuery( '<div class="load-test"></div>' ).appendTo( "#qunit-fixture" );
            strictEqual( element.css( "font-size" ), "99px", "css style should be applied" );
    });

    jsType = jar.load( origin + "data/data.js",
                        "jar.load, explicetlly set data-type", "js" ).done(function() {
                ok( js, "Variable is assigned" );

                // cleanup
                window.js = undefined;
    });

    xml = jar.load( origin + "data/data.xml",
        "jar.load, explicitly set data-type" ).done(function( data ) {

        strictEqual( jar.type( data ), "xml", "Data is returned" );
    });

    wrongType = jar.load(  origin + "data/wrong-type.js",
                        "jar.load, explicetlly set data-type css", "css" ).done(function() {
        strictEqual( js, undefined, "Variable is not assigned" );

    });

    jar.when( css, jsType, xml, wrongType ).always(function() {
        start();
    });
});

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
                jar.filters.js( arguments[ i ][ 0 ] );
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

