module( "load", { teardown: moduleTeardown } );

asyncTest( "jar.load - js", function() {
    var path = "//" + window.location.host + window.location.pathname + "data/variable.js";

    jar( "jar.load - js" ).done(function() {
        this.clear().done(function() {

            // through xhr-request
            jar.load( path, "js", "jar.load - js" ).done(function( data, base ) {
                ok( data.length, "Data is returned" );
                ok( js, "Variable is assigned" );
                ok( base instanceof jar, "Second argument is instace of jar" );

                // cleanup
                window.js = undefined;

                // wait a bit, so data can be writed
                window.setTimeout(function() {

                    // through jar-store
                    jar.load( path, "js", "jar.load - js" ).done(function( data, base ) {
                        ok( data.length, "Data is returned" );
                        ok( js, "Variable is assigned" );
                        ok( base instanceof jar, "Second argument is instace of jar" );

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
    var path = "//" + window.location.host + window.location.pathname + "data/data.xml";

    jar( "jar.load - xml" ).done(function() {
        this.clear().done(function() {

            // through xhr-request
            jar.load( path, "xml", "jar.load - xml" ).done(function( data, base ) {
                strictEqual( jar.type( data ), "xml", "Data is returned" );
                ok( base instanceof jar, "Second argument is instace of jar" );

                // wait a bit, so data can be writed
                window.setTimeout(function() {

                    // through jar-store
                    jar.load( path, "xml", "jar.load - xml" ).done(function( data, base ) {
                        strictEqual( jar.type( data ), "xml", "Data is returned" );
                        ok( base instanceof jar, "Second argument is instace of jar" );

                        start();
                    });
                }, 100 );
            });
        });
    });
});