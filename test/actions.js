module( "actions", {
    teardown: moduleTeardown
});

/*
asyncTest( "Complete removal of object store", 3, function() {
    jar( "test-1", "idb fs" ).done(function() {
        this.clear().done(function() {
            ok( !!this.instances.idb.db && !!this.instances.fs.db, "Test-1 base should be created two types of base – idb fs" )

            this.set( "test", "test" ).done(function() {
                var def;

                ok( this.instances.idb.store.indexNames.length === 1, "For idb data should be exist" );

                def = this.register();
                def.done(function( data ) {
                        ok( false, "Data should be added only for idb store" );
                    })
                    .fail(function() {
                        ok( true, "Data should be added only for idb store" );
                    })
                    .always( start );

                this.fs.get.apply( this, [ "test", "text", def.id ] );
            });
        }).fail(function() {
            ok( false, "Failed to clear data for tests" )
        })
    })
});
 */
