module( "core", { teardown: moduleTeardown } );
asyncTest( "Global stuff", 1, function() {
    jar( "@_#-!$%^&*()_+=фt" ).done(function() {
        strictEqual( this.name, "replreplreplreplreplreplreplreplreplreplreplreplreplreplreplreplt",
         "Name was successfully changed" );

        start();
    });
});
