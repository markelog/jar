module( "idb", {
    teardown: moduleTeardown
});

asyncTest( "Check get and set methods", 13, function() {
    jar( "idb", "idb" ).done(function() {
        var html = document.implementation.createDocument( "http://www.w3.org/1999/xhtml", "html", null ),
            body = new XMLSerializer().serializeToString( document.body.firstElementChild ),
            xmlStr = "<xml>test</xml>",
            xml = new window.DOMParser().parseFromString( xmlStr, "text/xml"),
            json = { "test": "test" },
            js = "js = true";

        this.set( "text-1", "text" )
            .set( "text-2", "text", "text" )
            .set( "xml-1", xml )
            .set( "xml-2", xml, "xml" )
            .set( "xml-3", xmlStr, "xml" )
            .set( "html-1", html )
            .set( "html-2", html, "html" )
            .set( "html-3", body, "html" )
            .set( "js", js, "javascript" )
            .set( "json-1", json, "json" )
            .set( "json-2", json )

            .promise().done(function() {
                this.get( "text-1" ).done(function( data ) {
                        strictEqual( typeof data, "string", "Data type of text should be text" );
                    })

                    .get( "text-2" ).done(function( data ) {
                        strictEqual( typeof data, "string", "Data of specified type of text should be text" );
                    })

                    .get( "xml-1" ).done(function( data ) {
                        strictEqual( jar.type( data ), "xml", "Data type should be xml" );
                    })

                    .get( "xml-2" ).done(function( data ) {
                        strictEqual( jar.type( data ), "xml", "Data of specified type of xml should be xml" );
                    })

                    .get( "xml-3" ).done(function( data ) {
                        strictEqual( jar.type( data ), "xml", "Data of specified type of xml string should be xml" );
                    })

                    .get( "html-1" ).done(function( data ) {
                        strictEqual( jar.type( data ), "html", "Data type should be html" );
                    })

                    .get( "html-2" ).done(function( data ) {
                        strictEqual( jar.type( data ), "html", "Data of specified type of html should be html" );
                    })

                    .get( "html-3" ).done(function( data ) {
                        strictEqual( jar.type( data ), "html", "Data of specified type of html should be html" );
                    })

                    .get( "js" ).done(function( data ) {
                        strictEqual( jar.type( data ), "text", "Data of specified type of javascript should be text" );
                        ok ( window.js, "js global variable should be defined" );
                        strictEqual( data, js, "Data should look like simple text" );

                        // cleanup
                        window.js = undefined;
                    })

                    .get( "json-1" ).done(function( data ) {
                        strictEqual( jar.type( data ), "json", "Data of specified type of json should be json" );
                    })

                    .get( "json-2" ).done(function( data ) {
                        strictEqual( jar.type( data ), "json", "Data type of json should be json" );
                    })

                    .promise().done( start );
            });
    });
});

asyncTest( "Complete removal of object store", 1, function() {
    jar( "idb-1", "idb" )
        .done(function() {
            this.set( "1", "2" ).done(function() {
                this.get( "1" ).done(function( data ) {
                    this.remove()
                        .done(function() {
                            ok( !~[].indexOf.call( jar.idb.db.objectStoreNames, this.name ), "Store was completely removed" );
                        })
                        .fail(function() {
                            ok( false, "Store was not completely removed" );
                        })
                        .always( start );
                });
            });
        })
        .fail(function() {
            ok( false, "Can't create object store" );
            start();
        });
});

asyncTest( "Clear object store", 1, function() {
    jar( "idb-2", "idb" ).done(function() {
        this.set( "1", "2" ).done(function() {
            this.clear()
                .done(function() {
                    this.get( "1" )
                        .done(function() {
                            ok( false, "Data was not cleared" );
                        })
                        .fail(function() {
                            ok( true, "Data was cleared" );
                        })
                        .always( start );
                })
                .fail(function() {
                    ok( false, "Store was not cleared" );
                    start();
                });
        });
    });
});

asyncTest( "Complete removal of object store after it was removed", 1, function() {
    jar( "idb-3", "idb" ).done(function() {
        this.set( "1", "2" ).done(function() {
            this.get( "1" ).done(function( data ) {
                this.remove().done(function() {
                    this.setup( "idb" )
                        .done(function() {
                            ok( jar.idb.db.objectStoreNames.contains( this.name ), "Store was setted, after being removed" );
                        })
                        .fail(function() {
                            ok( false, "Store was not setted, after being removed" );
                        })
                        .always( start );
                }).fail(function() {
                    ok( false, "Store was not removed" );
                    start();
                })
            });
        });
    });
});

asyncTest( "Parallel store creation should work", 2, function() {
    jar( "idb-1", "idb" ).done(function() {
        ok( true, "First store created" );
    });

    jar( "idb-2", "idb" ).done(function() {
        ok( true, "Second store created" );

        // Assuming this request will be the last one
        start();
    });
});