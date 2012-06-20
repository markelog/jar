module( "lc", {
    teardown: moduleTeardown
});

test( "Simple set and get", function() {
    var values = {
            text: "test",
            json: { test: "test" }
        };

    jar( "lc", "lc" ).set( "text", values.text ).done(function() {
        this.get( "text" )
            .done(function( data, type ) {
                strictEqual( data, values.text, "set and get ok for text type" );
                strictEqual( type, "text", 'type argument should be set to "text"' );
            })
            .fail(function() {
                ok( false, "fail should not be called for successful operation" );
            });
    });

    jar( "lc", "lc" ).set( "json", values.json ).done(function() {
        this.get( "json" )
            .done(function( data, type ) {
                strictEqual( data.test, "test", "set and get ok for json type" );
                strictEqual( type, "json", 'type argument should be set to "json"' );
            })
            .always(function() {
                ok( true, "always should be called for successful operation" );
            });
    });

    jar( "lc", "lc" ).get( "not-existed" )
        .fail(function( data ) {
            ok( true, "fail should be called" );
        })
        .always(function() {
            ok( true, "always should be called for fail operation" );
        });
});

test( "Remove method", function() {
    expect( 1 );

    jar( "lc", "lc" ).set( "test", "test" ).done(function() {

        // Make sure data is writed
        this.get( "test" ).done(function( data ) {
            this.remove( "test" ).done(function( data ) {
                this.get( "bla" )
                    .fail(function() {
                        ok( true, "data was successfully removed" );
                    }).done( function() {
                        ok( false, "data was not removed" );
                    });
            });
        });
    });
});

test( "Differentiate data in diffrent data-sets", function() {
    expect( 1 );

    jar( "lc-1", "lc" ).set( "test", "test1" ).done(function() {
        this.get( "test" ).done(function( test1 ) {
            jar( "lc-2", "lc" ).set( "test", "test2" ).done(function() {
                this.get( "test" ).done(function( test2 ) {
                    ok( test1 !== test2, "In diffrent data-sets diffrent data" );
                    start();
                });
            });
        });
    });
});
