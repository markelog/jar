module( "core", { teardown: moduleTeardown } );

asyncTest( "Global stuff", 1, function() {
    jar( "@_#-!$%^&*()_+=фt" ).done(function() {
        strictEqual( this.name, "repl_replreplreplreplreplreplreplreplreplrepl_replreplreplt",
         "Name was successfully changed" );

        start();
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
});

test( "Check jar.text", function() {
    var xmlStr = "<xml>test</xml>";

    strictEqual( "string", typeof jar.text.html( document.body ), "jar.text.html call on body should return string" )


});
