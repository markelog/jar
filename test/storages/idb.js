module( "idb", {
    teardown: moduleTeardown
});

asyncTest( "indexedDB references", 2, function() {
    jar( "indexedDB references" ).done(function() {
        ok( this.stores.fs, "References for idb store was created" );
        ok( ~this.storages.indexOf( "idb" ), "References in array storages should be present" );

        start();
    });
});

asyncTest( "Check get and set methods", 57, function() {
    jar( "idb", "idb" ).done(function() {
        var html = document.implementation.createDocument( "http://www.w3.org/1999/xhtml", "html", null ),
            body = new XMLSerializer().serializeToString( document.body.firstElementChild ),
            xmlStr = "<xml>test</xml>",
            xml = new window.DOMParser().parseFromString( xmlStr, "text/xml"),
            json = { "test": "test" },
            js = "js = true";

        this.set( "text-1", "text" ).done(function( type, storage ) {
            strictEqual( type, "text", "Data type should be text" );
            strictEqual( storage, "idb", "Storage should be idb" );
        })
            .set( "text-2", "text", "text" ).done(function( type, storage ) {
                strictEqual( type, "text", "Data type should be text" );
                strictEqual( storage, "idb", "Storage should be idb" );
            })
            .set( "xml-1", xml ).done(function( type, storage ) {
                strictEqual( type, "xml", "Data type should be xml" );
                strictEqual( storage, "idb", "Storage should be idb" );
            })
            .set( "xml-2", xml, "xml" ).done(function( type, storage ) {
                strictEqual( type, "xml", "Data type should be xml" );
                strictEqual( storage, "idb", "Storage should be idb" );
            })
            .set( "xml-3", xmlStr, "xml" ).done(function( type, storage ) {
                strictEqual( type, "xml", "Data type should be xml" );
                strictEqual( storage, "idb", "Storage should be idb" );
            })
            .set( "html-1", html ).done(function( type, storage ) {
                strictEqual( type, "html", "Data type should be html" );
                strictEqual( storage, "idb", "Storage should be idb" );
            })
            .set( "html-2", html, "html" ).done(function( type, storage ) {
                strictEqual( type, "html", "Data type should be html" );
                strictEqual( storage, "idb", "Storage should be idb" );
            })
            .set( "html-3", body, "html" ).done(function( type, storage ) {
                strictEqual( type, "html", "Data type should be html" );
                strictEqual( storage, "idb", "Storage should be idb" );
            })
            .set( "js", js, "javascript" ).done(function( type, storage ) {
                strictEqual( type, "javascript", "Data type should be javascript" );
                strictEqual( storage, "idb", "Storage should be idb" );
            })
            .set( "json-1", json, "json" ).done(function( type, storage ) {
                strictEqual( type, "json", "Data type should be json" );
                strictEqual( storage, "idb", "Storage should be idb" );
            })
            .set( "json-2", json ).done(function( type, storage ) {
                strictEqual( type, "json", "Data type should be json" );
                strictEqual( storage, "idb", "Storage should be idb" );
            })

            .promise().done(function() {
                this.get( "text-1" ).done(function( data, type, storage ) {
                        strictEqual( typeof data, "string", "Data type of text should be text" );
                        strictEqual( type, "text", "Data type should be text" );
                        strictEqual( storage, "idb", "Storage should be idb" );
                    })

                    .get( "text-2" ).done(function( data, type, storage ) {
                        strictEqual( typeof data, "string", "Data of specified type of text should be text" );
                        strictEqual( type, "text", "Data type should be text" );
                        strictEqual( storage, "idb", "Storage should be idb" );
                    })

                    .get( "xml-1" ).done(function( data, type, storage ) {
                        strictEqual( jar.type( data ), "xml", "Data type should be xml" );
                        strictEqual( type, "xml", "Data type should be xml" );
                        strictEqual( storage, "idb", "Storage should be idb" );
                    })

                    .get( "xml-2" ).done(function( data, type, storage ) {
                        strictEqual( jar.type( data ), "xml", "Data of specified type of xml should be xml" );
                        strictEqual( type, "xml", "Data type should be xml" );
                        strictEqual( storage, "idb", "Storage should be idb" );
                    })

                    .get( "xml-3" ).done(function( data, type, storage ) {
                        strictEqual( jar.type( data ), "xml", "Data of specified type of xml string should be xml" );
                        strictEqual( type, "xml", "Data type should be xml" );
                        strictEqual( storage, "idb", "Storage should be idb" );
                    })

                    .get( "html-1" ).done(function( data, type, storage ) {
                        strictEqual( jar.type( data ), "html", "Data type should be html" );
                        strictEqual( type, "html", "Data type should be html" );
                        strictEqual( storage, "idb", "Storage should be idb" );
                    })

                    .get( "html-2" ).done(function( data, type, storage ) {
                        strictEqual( jar.type( data ), "html", "Data of specified type of html should be html" );
                        strictEqual( type, "html", "Data type should be html" );
                        strictEqual( storage, "idb", "Storage should be idb" );
                    })

                    .get( "html-3" ).done(function( data, type, storage ) {
                        strictEqual( jar.type( data ), "html", "Data of specified type of html should be html" );
                        strictEqual( type, "html", "Data type should be html" );
                        strictEqual( storage, "idb", "Storage should be idb" );
                    })

                    .get( "js" ).done(function( data, type, storage ) {
                        strictEqual( jar.type( data ), "text", "Data of specified type of javascript should be text" );
                        ok ( window.js, "js global variable should be defined" );
                        strictEqual( data, js, "Data should look like simple text" );

                        // cleanup
                        window.js = undefined;
                        strictEqual( type, "javascript", "Data type should be javascript" );
                        strictEqual( storage, "idb", "Storage should be idb" );
                    })

                    .get( "json-1" ).done(function( data, type, storage ) {
                        strictEqual( jar.type( data ), "json", "Data of specified type of json should be json" );
                        strictEqual( type, "json", "Data type should be json" );
                        strictEqual( storage, "idb", "Storage should be idb" );
                    })

                    .get( "json-2" ).done(function( data, type, storage ) {
                        strictEqual( jar.type( data ), "json", "Data type of json should be json" );
                        strictEqual( type, "json", "Data type should be javascript" );
                        strictEqual( storage, "idb", "Storage should be idb" );
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