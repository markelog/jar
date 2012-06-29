module( "fs", {
    teardown: moduleTeardown
});

asyncTest( "Check get and set methods", 35, function() {
    jar( "fs", "fs" ).done(function() {
        var html = document.implementation.createDocument( "http://www.w3.org/1999/xhtml", "html", null ),
            body = new XMLSerializer().serializeToString( document.body.firstElementChild ),
            xmlStr = "<xml>test</xml>",
            xml = new window.DOMParser().parseFromString( xmlStr, "text/xml"),
            json = { "test": "test" },
            js = "js = true";

        this.set( "text-1", "text" ).done(function( type, storage ) {
            strictEqual( type, "text", "Data type should be text" );
            strictEqual( storage, "fs", "Storage should be fs" );
        })
            .set( "text-2", "text", "text" ).done(function( type, storage ) {
                strictEqual( type, "text", "Data type should be text" );
                strictEqual( storage, "fs", "Storage should be fs" );
            })
            .set( "xml-1", xml ).done(function( type, storage ) {
                strictEqual( type, "xml", "Data type should be xml" );
                strictEqual( storage, "fs", "Storage should be fs" );
            })
            .set( "xml-2", xml, "xml" ).done(function( type, storage ) {
                strictEqual( type, "xml", "Data type should be xml" );
                strictEqual( storage, "fs", "Storage should be fs" );
            })
            .set( "xml-3", xmlStr, "xml" ).done(function( type, storage ) {
                strictEqual( type, "xml", "Data type should be xml" );
                strictEqual( storage, "fs", "Storage should be fs" );
            })
            .set( "html-1", html ).done(function( type, storage ) {
                strictEqual( type, "html", "Data type should be html" );
                strictEqual( storage, "fs", "Storage should be fs" );
            })
            .set( "html-2", html, "html" ).done(function( type, storage ) {
                strictEqual( type, "html", "Data type should be html" );
                strictEqual( storage, "fs", "Storage should be fs" );
            })
            .set( "html-3", body, "html" ).done(function( type, storage ) {
                strictEqual( type, "html", "Data type should be html" );
                strictEqual( storage, "fs", "Storage should be fs" );
            })
            .set( "js", js, "javascript" ).done(function( type, storage ) {
                strictEqual( type, "javascript", "Data type should be javascript" );
                strictEqual( storage, "fs", "Storage should be fs" );
            })
            .set( "json-1", json, "json" ).done(function( type, storage ) {
                strictEqual( type, "json", "Data type should be json" );
                strictEqual( storage, "fs", "Storage should be fs" );
            })
            .set( "json-2", json ).done(function( type, storage ) {
                strictEqual( type, "json", "Data type should be json" );
                strictEqual( storage, "fs", "Storage should be fs" );
            })

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

asyncTest( "Complete removal of object store", 3, function() {
    jar( "fs-1", "fs" ).done(function() {
        this.remove()
            .done(function() {
                var name = this.name,
                    self = this;

                jar.fs.db.getDirectory( "fs-1", {}, function() {
                    ok( false, "Store was not removed" );

                    start();
                }, function() {
                    ok( true, "Store was not removed" );

                    strictEqual( jar.data[ name ], undefined, "Meta data about storages was removed for this store" );
                    strictEqual( self.dir, undefined, "Store was removed from jar instance" );

                    start();
                });
            }).fail(function() {
                ok( false, "Store was not removed" );
            });
    });
});

asyncTest( "Clear object store", 3, function() {
    jar( "fs-1", "fs" ).done(function() {
        this.set( "test", "test" ).clear().done(function() {
            var name = this.name;
                self = this;

            this.stores.fs.getFile( "test", {}, function() {
                ok( true, "Data was cleared" );
                strictEqual( jar.data[ name ]._length, 0, "Length of storages was setted to 0" );
                ok( !!self.stores.fs, "Reference still exist" );

                start();
            }, function() {
                ok( false, "Data was not cleared" );
                start();
            });
        }).fail(function() {
            ok( false, "Data was not cleared" );
        })
    });
});

asyncTest( "Parallel store creation should work", 2, function() {
    var fs3active, fs4active;

    fs3active = jar( "fs-3", "fs" ).done(function() {
        ok( true, "First store created" );
    }).fail(function() {
        ok( false, "Second store not created" );
    }).active,

    fs4active = jar( "fs-4", "fs" ).done(function() {
        ok( true, "Second store created" );
    })
    .fail(function() {
        ok( false, "Second store not created" );
    }).active;

    jar.when( fs3active, fs4active ).always(function() {
        start();
    })

});

