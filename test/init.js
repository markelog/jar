module( "init", {
    teardown: moduleTeardown
});

test( "jar.preference", function() {
    jar.preference();

    var isMoz = !!~window.navigator.userAgent.indexOf( "Firefox" ),
        vendor = window.navigator.vendor,
        xml = jar.order.xml[ 0 ];

    jar.preference({
        js: [ "lc" ],
        css: [ "lc" ]
    });

    strictEqual( jar.order.js[ 0 ], "lc", 'This value should be "lc"' );
    strictEqual( jar.order.css[ 0 ], "lc", 'This value should be "lc"' );
    strictEqual( jar.order.js, jar.order.javascript, '"javascript" prop should be alias to "js" prop' );
    ok( !jar.order.xml, "With new preference this prop should not be exist" );

    if ( isMoz ) {
        jar.preference({
            js: [ "idb", "lc" ]
        }, true );

        strictEqual( jar.order.js[ 0 ], "idb",
            "When user specified storages he wants to use limitations for idb storage in mozilla should not be applied when second argument is provided" );
    }

    jar.preference();

    // In safari and Mozilla all types of data should be set to localStorage
    if ( vendor && ~vendor.indexOf( "Apple" ) || isMoz ) {
        strictEqual( jar.order.js[ 0 ], "lc", 'This value should be "lc"' );
        strictEqual( jar.order.html[ 0 ], "lc", 'This value should be "lc"' );
        strictEqual( jar.order.xml[ 0 ], "lc", 'This value should be "lc"' );
        strictEqual( jar.order.json[ 0 ], "lc", 'This value should be "lc"' );
        strictEqual( jar.order.text[ 0 ], "lc", 'This value should be "lc"' );
        strictEqual( jar.order.js, jar.order.javascript, '"javascript" prop should be alias to "js" prop' );
    }

    strictEqual( jar.order.xml[ 0 ], xml, "Settings should get back to default value" );

    if ( isMoz ) {
        ok( !jar.isUsed( "idb" ), "IndexedDB is not used in Firefox" );

    } else if ( jar.fn.support.idb ) {
        ok( jar.isUsed( "idb" ), "IndexedDB can be used" );
    }

    if ( jar.fn.support.fs ) {
        ok( jar.isUsed( "fs" ), "FileSystem can be used" );
    }

    if ( jar.fn.support.sql ) {
        ok( jar.isUsed( "sql" ), "Web SQL can be used" );
    }

    jar.preference( true );

    if ( isMoz ) {
        ok( jar.isUsed( "idb" ), "IndexedDB is used in Firefox" );
        ok( !!~jQuery.inArray( "idb", jar.fn.storages ), "IndexedDB is used in Firefox" );
    }

    jar.preference();
});

