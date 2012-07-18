module( "init", {
    teardown: moduleTeardown
});

test( "jar.preference", function() {
    jar.preference({
        js: [ "lc" ],
        css: [ "lc" ]
    });

    strictEqual( jar.order.js[ 0 ], "lc", 'This value should be "lc"' );
    strictEqual( jar.order.js[ 0 ], "lc", 'This value should be "lc"' );
    strictEqual( jar.order.css[ 0 ], "lc", 'This value should be "lc"' );
    strictEqual( jar.order.css[ 0 ], "lc", 'This value should be "lc"' );
    strictEqual( jar.order.js, jar.order.javascript, '"javascript" prop should be alias to "js" prop' );
    ok( !jar.order.xml, "With new preference this prop should not be exist" );

    if ( !window.mozIndexedDB ) {
        window.mozIndexedDB = "test";
    }

    jar.preference({
        js: [ "idb", "lc" ]
    });

    strictEqual( jar.order.js[ 0 ], "lc", 'Even if idb exist we still will be using lc storage for mozilla' );

    jar.preference();

    ok( jar.order.xml, "Settings should get back to default value" );

    // cleanup
    if ( window.mozIndexedDB == "test" ) {
        window.mozIndexedDB = undefined;
    }
});

