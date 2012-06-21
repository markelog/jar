module( "lc", {
    teardown: moduleTeardown
});

asyncTest( "Check get and set methods", 13, function() {
    var lc = jar( "lc", "lc" ).done(function() {
        var html = document.implementation.createDocument( "http://www.w3.org/1999/xhtml", "html", null ),
            body = new XMLSerializer().serializeToString( document.body.firstElementChild ),
            xmlStr = "<xml>test</xml>",
            xml = new window.DOMParser().parseFromString( xmlStr, "text/xml"),
            json = { "test": "test" },
            js = "js = true";

        lc.set( "text-1", "text" )
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

asyncTest( "Simple set and get", 7, function() {
    var values = {
            text: "test",
            json: { test: "test" }
        };

        jar( "lc", "lc" ).done(function() {
            this.set( "text", values.text ).done(function() {
                this.get( "text" )
                    .done(function( data, type ) {
                        strictEqual( data, values.text, "set and get ok for text type" );
                        strictEqual( type, "text", 'type argument should be set to "text"' );
                    })
                    .fail(function() {
                        ok( false, "fail should not be called for successful operation" );
                    });
            });


        this.set( "json", values.json ).done(function() {
            this.get( "json" )
                .done(function( data, type ) {
                    strictEqual( data.test, "test", "set and get ok for json type" );
                    strictEqual( type, "json", 'type argument should be set to "json"' );
                })
                .always(function() {
                    ok( true, "always should be called for successful operation" );
                });
        });

        this.get( "not-existed" )
            .fail(function( data ) {
                ok( true, "fail should be called" );
            })
            .always(function() {
                ok( true, "always should be called for fail operation" );
            });

        this.promise().done(function() {
            start();
        });

    });
});

asyncTest( "Remove method", 1, function() {
    jar( "lc", "lc" ).done(function() {
            this.set( "test", "test" ).done(function() {

                // Make sure data is writed
                this.get( "test" ).done(function( data ) {
                    this.remove( "test" ).done(function( data ) {
                        this.get( "bla" )
                            .fail(function() {
                                ok( true, "data was successfully removed" );
                            }).done( function() {
                                ok( false, "data was not removed" );
                            }).always( start )
                    });
                });
            });
    });
});

asyncTest( "Differentiate data in diffrent data-sets", 1, function() {
    jar( "lc-1", "lc" ).done(function() {
        this.set( "test", "test1" ).done(function() {
            this.get( "test" ).done(function( test1 ) {
                jar( "lc-2", "lc" ).done(function() {
                    this.set( "test", "test2" ).done(function() {
                        this.get( "test" ).done(function( test2 ) {
                            ok( test1 !== test2, "In diffrent data-sets diffrent data" );
                            start();
                        });
                    });
                });
            });
        });
    });
});

asyncTest( "Test asynchronous of fc methods", 5, function() {
    var setup = jar( "lc", "lc" ).done(function() {
        var get, set, clear, remove;

        ok( setup, '"setup" variable should be defined' );

        set = this.set( "set", "set" ).done(function() {
            ok( set, '"set" variable should be defined' );

            get = this.get( "set" ).done(function() {
                ok( get, '"get" variable should be defined' );

                clear = this.clear().done(function() {
                    ok( clear, '"clear" variable should be defined' );
                });

                remove = this.remove().done(function() {
                    ok( remove, '"remove" variable should be defined' );

                    start();
                });
            });
        });
    });
});
