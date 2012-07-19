module( "core", { teardown: moduleTeardown } );

asyncTest( "Global stuff", 3, function() {
    var turtle = jar( "big turtle" ),

        // I want to use bear store only with localStorage
        bear = jar( "sexy bear", "lc" /* idb fs sql */ );

    jar.when( turtle, bear ).done(function( turtle, bear ) {
        var def = jar.Deferred();

        turtle.set( "set stuff", "bla-blah" ).done(function() {
            ok( true, "stuff is setted" );

            def.resolve();
        });

        bear.remove().done(function() {
            ok( true, "bear is removed" )

            jar( "@_#-!$%^&*()_+=фt" ).done(function() {
                strictEqual( this.name, "________________t",
                 "Name was successfully changed" );

                def.done( start );
            });
        });
    });
});

test( "Check jar.type", function() {
    var xmlStr = "<xml>test</xml>";

    if ( document.implementation  && document.implementation.createDocument ) {
        strictEqual( jar.type( document.implementation.createDocument( "http://www.w3.org/1999/xhtml", "html", null ) ),
            "html", "This type of data should be html" );
    }

    strictEqual( jar.type( document.body ), "html", "This type of data should be html" );
    strictEqual( jar.type( jar.filters.xml( xmlStr ) ), "xml", "This type of data should be xml" );
    strictEqual( jar.type( xmlStr ), "text", "This type of data should be text" );
    strictEqual( jar.type( { "test": "test" } ), "json", "This type of data should be json" );
    strictEqual( jar.type( { test: "test" } ), "json", "Even though it is not correct, json-like data type should be json" );
    strictEqual( jar.type(), undefined, "jar.type called without arguments should return undefined" )
    strictEqual( jar.type( "" ), "text", 'jar.type called with empty string should return "text"' )
    strictEqual( jar.type( null ), undefined, 'jar.type called with null argument should return undefined' )
});

test( "Check jar.text", function() {
    var xmlStr = "<xml>test</xml>";

    strictEqual( "string", typeof jar.text.html( document.body ), "jar.text.html call on body should return string" )
});

asyncTest( "jar.has", 3, function() {
    jar( "jar.has" ).done(function() {
        this.set( "name", document.body ).done(function() {
            ok( jar.has( "jar.has", "name" ), "jar.has should work in most common case" );

            this.set( "empty", "" ).done(function() {
                ok( jar.has( "jar.has", "empty" ), "jar.has should work on empty string" );
                ok( !jar.has( "jar.has", "not-exist" ), "jar.has should return false for not-existed key" );

                start();
            });
        });
    });
});
