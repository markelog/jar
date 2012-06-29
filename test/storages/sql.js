module( "sql", {
    teardown: moduleTeardown
});

asyncTest( "WebSQL references", 2, function() {
    jar( "WebSQL references" ).done(function() {
        ok( this.stores.sql, "References for WebSQL store was created" );
        ok( ~this.storages.indexOf( "sql" ), "References in array storages should be present" );

        start();
    });
});

asyncTest( "Check get and set methods", 57, function() {
    jar( "sql", "sql" ).done(function() {
        var html = document.implementation.createDocument( "http://www.w3.org/1999/xhtml", "html", null ),
            body = new XMLSerializer().serializeToString( document.body.firstElementChild ),
            xmlStr = "<xml>test</xml>",
            xml = new window.DOMParser().parseFromString( xmlStr, "text/xml"),
            json = { "test": "test" },
            js = "js = true";

        this.set( "text-1", "text" ).done(function( type, storage ) {
            strictEqual( type, "text", "Data type should be text" );
            strictEqual( storage, "sql", "Storage should be sql" );
        })
            .set( "text-2", "text", "text" ).done(function( type, storage ) {
                strictEqual( type, "text", "Data type should be text" );
                strictEqual( storage, "sql", "Storage should be sql" );
            })
            .set( "xml-1", xml ).done(function( type, storage ) {
                strictEqual( type, "xml", "Data type should be xml" );
                strictEqual( storage, "sql", "Storage should be sql" );
            })
            .set( "xml-2", xml, "xml" ).done(function( type, storage ) {
                strictEqual( type, "xml", "Data type should be xml" );
                strictEqual( storage, "sql", "Storage should be sql" );
            })
            .set( "xml-3", xmlStr, "xml" ).done(function( type, storage ) {
                strictEqual( type, "xml", "Data type should be xml" );
                strictEqual( storage, "sql", "Storage should be sql" );
            })
            .set( "html-1", html ).done(function( type, storage ) {
                strictEqual( type, "html", "Data type should be html" );
                strictEqual( storage, "sql", "Storage should be sql" );
            })
            .set( "html-2", html, "html" ).done(function( type, storage ) {
                strictEqual( type, "html", "Data type should be html" );
                strictEqual( storage, "sql", "Storage should be sql" );
            })
            .set( "html-3", body, "html" ).done(function( type, storage ) {
                strictEqual( type, "html", "Data type should be html" );
                strictEqual( storage, "sql", "Storage should be sql" );
            })
            .set( "js", js, "javascript" ).done(function( type, storage ) {
                strictEqual( type, "javascript", "Data type should be javascript" );
                strictEqual( storage, "sql", "Storage should be sql" );
            })
            .set( "json-1", json, "json" ).done(function( type, storage ) {
                strictEqual( type, "json", "Data type should be json" );
                strictEqual( storage, "sql", "Storage should be sql" );
            })
            .set( "json-2", json ).done(function( type, storage ) {
                strictEqual( type, "json", "Data type should be json" );
                strictEqual( storage, "sql", "Storage should be sql" );
            })

            .promise().done(function() {
                this.get( "text-1" ).done(function( data, type, storage ) {
                        strictEqual( typeof data, "string", "Data type of text should be text" );
                        strictEqual( type, "text", "Data type should be text" );
                        strictEqual( storage, "sql", "Storage should be sql" );
                    })

                    .get( "text-2" ).done(function( data, type, storage ) {
                        strictEqual( typeof data, "string", "Data of specified type of text should be text" );
                        strictEqual( type, "text", "Data type should be text" );
                        strictEqual( storage, "sql", "Storage should be sql" );
                    })

                    .get( "xml-1" ).done(function( data, type, storage ) {
                        strictEqual( jar.type( data ), "xml", "Data type should be xml" );
                        strictEqual( type, "xml", "Data type should be xml" );
                        strictEqual( storage, "sql", "Storage should be sql" );
                    })

                    .get( "xml-2" ).done(function( data, type, storage ) {
                        strictEqual( jar.type( data ), "xml", "Data of specified type of xml should be xml" );
                        strictEqual( type, "xml", "Data type should be xml" );
                        strictEqual( storage, "sql", "Storage should be sql" );
                    })

                    .get( "xml-3" ).done(function( data, type, storage ) {
                        strictEqual( jar.type( data ), "xml", "Data of specified type of xml string should be xml" );
                        strictEqual( type, "xml", "Data type should be xml" );
                        strictEqual( storage, "sql", "Storage should be sql" );
                    })

                    .get( "html-1" ).done(function( data, type, storage ) {
                        strictEqual( jar.type( data ), "html", "Data type should be html" );
                        strictEqual( type, "html", "Data type should be html" );
                        strictEqual( storage, "sql", "Storage should be sql" );
                    })

                    .get( "html-2" ).done(function( data, type, storage ) {
                        strictEqual( jar.type( data ), "html", "Data of specified type of html should be html" );
                        strictEqual( type, "html", "Data type should be html" );
                        strictEqual( storage, "sql", "Storage should be sql" );
                    })

                    .get( "html-3" ).done(function( data, type, storage ) {
                        strictEqual( jar.type( data ), "html", "Data of specified type of html should be html" );
                        strictEqual( type, "html", "Data type should be html" );
                        strictEqual( storage, "sql", "Storage should be sql" );
                    })

                    .get( "js" ).done(function( data, type, storage ) {
                        strictEqual( jar.type( data ), "text", "Data of specified type of javascript should be text" );
                        ok ( window.js, "js global variable should be defined" );
                        strictEqual( data, js, "Data should look like simple text" );

                        // cleanup
                        window.js = undefined;
                        strictEqual( type, "javascript", "Data type should be javascript" );
                        strictEqual( storage, "sql", "Storage should be sql" );
                    })

                    .get( "json-1" ).done(function( data, type, storage ) {
                        strictEqual( jar.type( data ), "json", "Data of specified type of json should be json" );
                        strictEqual( type, "json", "Data type should be json" );
                        strictEqual( storage, "sql", "Storage should be sql" );
                    })

                    .get( "json-2" ).done(function( data, type, storage ) {
                        strictEqual( jar.type( data ), "json", "Data type of json should be json" );
                        strictEqual( type, "json", "Data type should be javascript" );
                        strictEqual( storage, "sql", "Storage should be sql" );
                    })

                    .promise().done( start );
            });
    });
});

asyncTest( "Check specific to sql storage actions", 2, function() {
    jar( "sql-rewrite@_#t", "sql" ).done(function() {
        this.set( "test", "test1" ).done(function() {
            this.get( "test" ).done(function( data ) {
                strictEqual( data, "test1", "Initial data is correct" );

                this.set( "test", "test2" ).done(function() {
                    this.get( "test" ).done(function( data ) {
                        strictEqual( data, "test2", "Initial data is changed" );

                        start();
                    });
                });
            })
        });
    }).fail(function() {
        ok( false, "We can create table with name with not alphabetical symbols" );
    });
});


asyncTest( "Complete removal of object store", 1, function() {
    jar( "sql-1", "sql" )
        .done(function() {
            this.set( "1", "2" ).done(function() {
                this.get( "1" ).done(function( data ) {
                    this.remove()
                        .done(function() {

                            // sql prop will be deleted only if "remove" was successful
                            ok( !this.stores.sql, "Store was completely removed" );
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
    jar( "sql-2", "sql" ).done(function() {
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

asyncTest( "Parallel store creation should work", 2, function() {
    jar( "sql-1", "sql" ).done(function() {
        ok( true, "First store created" );
    });

    jar( "sql-2", "sql" ).done(function() {
        ok( true, "Second store created" );

        // Assuming this request will be the last one
        start();
    });
});