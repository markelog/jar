module( "core", { teardown: moduleTeardown } );

asyncTest( "Global stuff", function() {
    var turtle = jar( "shy turtle" ),

        // I want to use bear store only with localStorage
        bear = jar( "sexy bear", "lc" /* idb fs sql */ );

    jar.when( turtle, bear ).done(function( turtle, bear ) {
        var def = jar.Deferred();

        turtle.set( "set stuff", "bla-blah" ).done(function() {
            ok( true, "stuff is setted" );

            def.resolve();
        });

        bear.remove().done(function() {
            ok( true, "bear is removed" );
            ok( !jar.instances[ this.name ], "instance in jar object was removed" );

            jar( "@_#-!$%^&*()_+=фt" ).done(function() {
                strictEqual( this.name, "________________t", "Name was successfully changed" );
                ok( jar.instances[ this.name ], "instance was created" );

                def.done( start );
            });
        });
    });
});

asyncTest( "Re-create store", function() {
    jar( "Re-create store", "lc" ).done(function() {
        var stores = this.stores;

        jar( "Re-create store", "lc" ).done(function() {
            ok( this.stores === stores, "When instance with the same name is created once again, it should not re-created storages" );
            ok( this.stores === jar.instances[ this.name ], "Stores object written in jar object" );

            jar( "Re-create store", "idb" ).done(function() {
                if ( jar.prefixes.indexedDB ) {
                    ok( this.stores.idb, "Now we added idb storage in addition to lc" );

                } else {
                    ok( !this.stores.idb, "We don't have idb for this browser" );
                    ok( this.stores.lc, "But lc still should be defined" );
                }

                ok( this.stores === jar.instances[ this.name ], "Stores object written in jar object" );
                ok( !this.stores.sql, "But sql was not defined, so it should not be used" );

                this.setup( "sql" ).done(function() {
                    if ( window.openDatabase ) {
                        ok( this.stores.sql, "Now sql was defined" );
                        ok( this.stores === jar.instances[ this.name ], "Stores object written in jar object" );
                    }

                    this.remove().done(function() {
                        jar( "Re-create store" ).done(function() {
                            var stores;

                            ok( stores !== jar.instances[ this.name ], "Store in jar prop should be changed by now" );
                            stores = this.stores;

                            jar( "Re-create store" ).done(function() {
                                ok( this.stores === stores,
                                        "When instance with the same name is created once again, it should not re-created storages, without second argument" );
                                ok( this.stores === jar.instances[ this.name ], "Stores object written in jar object" );

                                // cleanup
                                this.remove().done( start );
                            });
                        });
                    });

                });
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
