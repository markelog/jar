// For tests we should be able to check indexedDB in Firefox too
jar.preference( true );

window.moduleTeardown = function() {
    stop()

    jar.destroy().always( start );
}

function checkGetSet( st ) {
    asyncTest( "Check get and set methods", 72, function() {
        jQuery.ajax({
            url: "//" + window.location.host + window.location.pathname + "data/data.xsl",
            dataType: "xml"
        }).done(function ( xsl ) {
            jar( st, st ).done(function() {
                var html = document.createElement( "div" ),
                    body = jar.text.html( document.body ),
                    xmlStr = "<xml>test</xml>",
                    xml = jar.filters.xml( xmlStr ),
                    json = { "test": "test" },
                    js = "js = true",
                    css = ".css-test{font-size:99px !important}";

                this.set( "text-1", "text" ).done(function( type, storage ) {
                    strictEqual( type, "text", "Data type should be text" );
                    ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                })
                    .set( "text-2", "text", "text" ).done(function( type, storage ) {
                        strictEqual( type, "text", "Data type should be text" );
                        ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                    })
                    .set( "xml-1", xml ).done(function( type, storage ) {
                        strictEqual( type, "xml", "Data type should be xml" );
                        ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                    })
                    .set( "xml-2", xml, "xml" ).done(function( type, storage ) {
                        strictEqual( type, "xml", "Data type should be xml" );
                        ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                    })
                    .set( "xml-3", xmlStr, "xml" ).done(function( type, storage ) {
                        strictEqual( type, "xml", "Data type should be xml" );
                        ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                    })

                    .set( "xsl-1", xsl ).done(function( type, storage ) {
                        strictEqual( type, "xml", "Data type should be xml" );
                        ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                    })

                    .set( "xsl-2", xsl, "xml" ).done(function( type, storage ) {
                        strictEqual( type, "xml", "Data type should be xml" );
                        ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                    })

                    .set( "html-1", html ).done(function( type, storage ) {
                        strictEqual( type, "html", "Data type should be html" );
                        ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                    })
                    .set( "html-2", html, "html" ).done(function( type, storage ) {
                        strictEqual( type, "html", "Data type should be html" );
                        ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                    })
                    .set( "html-3", body, "html" ).done(function( type, storage ) {
                        strictEqual( type, "html", "Data type should be html" );
                        ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                    })
                    .set( "js", js, "javascript" ).done(function( type, storage ) {
                        strictEqual( type, "javascript", "Data type should be javascript" );
                        ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                    })
                    .set( "json-1", json, "json" ).done(function( type, storage ) {
                        strictEqual( type, "json", "Data type should be json" );
                        ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                    })
                    .set( "json-2", json ).done(function( type, storage ) {
                        strictEqual( type, "json", "Data type should be json" );
                        ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                    })

                    .set( "css", css, "css" ).done(function( type, storage ) {
                        strictEqual( type, "css", "Data type should be css" );
                        ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                    })

                    .promise().always(function() {
                        this.get( "text-1" ).done(function( data, type, storage ) {
                                strictEqual( typeof data, "string", "Data type of text should be text" );
                                strictEqual( type, "text", "Data type should be text" );
                                ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                            })

                            .get( "text-2" ).done(function( data, type, storage ) {
                                strictEqual( typeof data, "string", "Data of specified type of text should be text" );
                                strictEqual( type, "text", "Data type should be text" );
                                ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                            })

                            .get( "xml-1" ).done(function( data, type, storage ) {
                                strictEqual( jar.type( data ), "xml", "Data type should be xml" );
                                strictEqual( type, "xml", "Data type should be xml" );
                                ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                            })

                            .get( "xml-2" ).done(function( data, type, storage ) {
                                strictEqual( jar.type( data ), "xml", "Data of specified type of xml should be xml" );
                                strictEqual( type, "xml", "Data type should be xml" );
                                ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                            })

                            .get( "xml-3" ).done(function( data, type, storage ) {
                                strictEqual( jar.type( data ), "xml", "Data of specified type of xml string should be xml" );
                                strictEqual( type, "xml", "Data type should be xml" );
                                ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                            })

                            .get( "xsl-1" ).done(function( data, type, storage ) {
                                strictEqual( jar.type( data ), "xml", "Data of specified type of xml string should be xml" );
                                strictEqual( type, "xml", "Data type should be xml" );
                                ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                            })

                            .get( "xsl-2" ).done(function( data, type, storage ) {
                                strictEqual( jar.type( data ), "xml", "Data of specified type of xml string should be xml" );
                                strictEqual( type, "xml", "Data type should be xml" );
                                ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                            })

                            .get( "html-1" ).done(function( data, type, storage ) {
                                strictEqual( jar.type( data ), "html", "Data type should be html" );
                                strictEqual( type, "html", "Data type should be html" );
                                ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                            })

                            .get( "html-2" ).done(function( data, type, storage ) {
                                strictEqual( jar.type( data ), "html", "Data of specified type of html should be html" );
                                strictEqual( type, "html", "Data type should be html" );
                                ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                            })

                            .get( "html-3" ).done(function( data, type, storage ) {
                                strictEqual( jar.type( data ), "html", "Data of specified type of html should be html" );
                                strictEqual( type, "html", "Data type should be html" );
                                ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                            })

                            .get( "js" ).done(function( data, type, storage ) {
                                strictEqual( jar.type( data ), "text", "Data of specified type of javascript should be text" );
                                ok ( window.js, "js global variable should be defined" );
                                strictEqual( data, js, "Data should look like simple text" );

                                // cleanup
                                window.js = undefined;

                                strictEqual( type, "javascript", "Data type should be javascript" );
                                ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                            })

                            .get( "json-1" ).done(function( data, type, storage ) {
                                strictEqual( jar.type( data ), "json", "Data of specified type of json should be json" );
                                strictEqual( type, "json", "Data type should be json" );
                                ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                            })

                            .get( "json-2" ).done(function( data, type, storage ) {
                                strictEqual( jar.type( data ), "json", "Data type of json should be json" );
                                strictEqual( type, "json", "Data type should be json" );
                                ok( ~jQuery.inArray( storage, st ? [ st ] : this.order[ type ] ), "Storage type should be correct" );
                            })

                            .get( "css" ).done(function( data, type, storage ) {
                                var element = jQuery( '<div class="css-test"></div>' ).appendTo( "#qunit-fixture" );

                                ok( data.nodeType, "Data should be a style or link element" );
                                strictEqual( type, "css", "Data type should be css" );
                                strictEqual( element.css( "font-size" ), "99px", "css style should be applied" );
                            })

                            .promise().always( start );
                    });
                });
        });
    });
}


function checkRemoved() {
   return this.get( "1" ).fail(function() {
        ok( true, "This key is not exist anymore" );

    }).set( "1", "2" ).fail(function() {
        ok( true, "You can't set values if store is not exist" )

    }).remove( "1" ).fail(function() {
        ok( true, "You can't remove values if store is not exist" );

    }).promise();
}

