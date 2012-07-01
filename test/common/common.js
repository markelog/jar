this.moduleTeardown = function() {
    var idb = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB,
        request = idb.deleteDatabase( "jar" );
    stop();


    request.onsuccess = start();
    request.onerror = function() {
        ok( false, "Can't remove idb database" );
    };

//    localStorage.clear();
}

function checkGetSet( st ) {
    var html = document.implementation.createDocument( "http://www.w3.org/1999/xhtml", "html", null ),
        body = new XMLSerializer().serializeToString( document.body.firstElementChild ),
        xmlStr = "<xml>test</xml>",
        xml = new window.DOMParser().parseFromString( xmlStr, "text/xml"),
        json = { "test": "test" },
        js = "js = true";

    this.set( "text-1", "text" ).done(function( type, storage ) {
        strictEqual( type, "text", "Data type should be text" );
        strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
    })
        .set( "text-2", "text", "text" ).done(function( type, storage ) {
            strictEqual( type, "text", "Data type should be text" );
            strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
        })
        .set( "xml-1", xml ).done(function( type, storage ) {
            strictEqual( type, "xml", "Data type should be xml" );
            strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
        })
        .set( "xml-2", xml, "xml" ).done(function( type, storage ) {
            strictEqual( type, "xml", "Data type should be xml" );
            strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
        })
        .set( "xml-3", xmlStr, "xml" ).done(function( type, storage ) {
            strictEqual( type, "xml", "Data type should be xml" );
            strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
        })
        .set( "html-1", html ).done(function( type, storage ) {
            strictEqual( type, "html", "Data type should be html" );
            strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
        })
        .set( "html-2", html, "html" ).done(function( type, storage ) {
            strictEqual( type, "html", "Data type should be html" );
            strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
        })
        .set( "html-3", body, "html" ).done(function( type, storage ) {
            strictEqual( type, "html", "Data type should be html" );
            strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
        })
        .set( "js", js, "javascript" ).done(function( type, storage ) {
            strictEqual( type, "javascript", "Data type should be javascript" );
            strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
        })
        .set( "json-1", json, "json" ).done(function( type, storage ) {
            strictEqual( type, "json", "Data type should be json" );
            strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
        })
        .set( "json-2", json ).done(function( type, storage ) {
            strictEqual( type, "json", "Data type should be json" );
            strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
        })

        .promise().done(function() {
            this.get( "text-1" ).done(function( data, type, storage ) {
                    strictEqual( typeof data, "string", "Data type of text should be text" );
                    strictEqual( type, "text", "Data type should be text" );
                    strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
                })

                .get( "text-2" ).done(function( data, type, storage ) {
                    strictEqual( typeof data, "string", "Data of specified type of text should be text" );
                    strictEqual( type, "text", "Data type should be text" );
                    strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
                })

                .get( "xml-1" ).done(function( data, type, storage ) {
                    strictEqual( jar.type( data ), "xml", "Data type should be xml" );
                    strictEqual( type, "xml", "Data type should be xml" );
                    strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
                })

                .get( "xml-2" ).done(function( data, type, storage ) {
                    strictEqual( jar.type( data ), "xml", "Data of specified type of xml should be xml" );
                    strictEqual( type, "xml", "Data type should be xml" );
                    strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
                })

                .get( "xml-3" ).done(function( data, type, storage ) {
                    strictEqual( jar.type( data ), "xml", "Data of specified type of xml string should be xml" );
                    strictEqual( type, "xml", "Data type should be xml" );
                    strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
                })

                .get( "html-1" ).done(function( data, type, storage ) {
                    strictEqual( jar.type( data ), "html", "Data type should be html" );
                    strictEqual( type, "html", "Data type should be html" );
                    strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
                })

                .get( "html-2" ).done(function( data, type, storage ) {
                    strictEqual( jar.type( data ), "html", "Data of specified type of html should be html" );
                    strictEqual( type, "html", "Data type should be html" );
                    strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
                })

                .get( "html-3" ).done(function( data, type, storage ) {
                    strictEqual( jar.type( data ), "html", "Data of specified type of html should be html" );
                    strictEqual( type, "html", "Data type should be html" );
                    strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
                })

                .get( "js" ).done(function( data, type, storage ) {
                    strictEqual( jar.type( data ), "text", "Data of specified type of javascript should be text" );
                    ok ( window.js, "js global variable should be defined" );
                    strictEqual( data, js, "Data should look like simple text" );

                    // cleanup
                    window.js = undefined;

                    strictEqual( type, "javascript", "Data type should be javascript" );
                    strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
                })

                .get( "json-1" ).done(function( data, type, storage ) {
                    strictEqual( jar.type( data ), "json", "Data of specified type of json should be json" );
                    strictEqual( type, "json", "Data type should be json" );
                    strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
                })

                .get( "json-2" ).done(function( data, type, storage ) {
                    strictEqual( jar.type( data ), "json", "Data type of json should be json" );
                    strictEqual( type, "json", "Data type should be json" );
                    strictEqual( storage, st || this.order[ type ][ 0 ], "Storage should be " + st || this.order[ type ][ 0 ] );
                })

                .promise().done( start );
        });
}


