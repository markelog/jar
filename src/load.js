!function() {
    function xhr( base, path, type, def ) {

        //request = new ( window.XMLHttpRequest, window.ActiveXObject )( "Microsoft.XMLHTTP" ); -- jshint :-(
        var request = window.XMLHttpRequest ? new window.XMLHttpRequest() : new window.ActiveXObject( "Microsoft.XMLHTTP" );

        request.open( "get", path, true );
        request.send();

        request.onreadystatechange = function() {
            if ( request.readyState != 4 ) {
                return;
            }

            var data;

            if ( request.status >= 200 && request.status < 300 || request.status === 304 ) {
                data = type == "xml" ? request.responseXML : request.responseText;

                jar.filters[ type ]( data );
                def.resolve([ data ]);

                // jar.order[ type ] – we work only with one specific storage
                jar( base, jar.order[ type ] ).done(function() {
                    this.set( path, data, type );
                });

                } else {
                    def.reject();
                }
            };

        return def;
    }

    jar.load = function( path, base, type ) {
            var def = jar.Deferred();

            if ( arguments.length != 3 ) {
                type = path.split( "." ).pop();
            }

            function make() {
                xhr( base, path, type, def );
            }

            // Quick hack, should be changed
            if ( type == "xsl" ) {
                type = "xml";
            }

            base = base || "jar";

            if ( jar.has( base, path ) ) {
                def = jar.Deferred();

                // jar.order[ type ] – we work only with one specific storage
                jar( base, jar.order[ type ] ).done(function() {
                    this.get( path ).done(function( data ) {
                        def.resolve([ data ]);

                // if we have data but we can't get it
                    }).fail( make );
                }).fail( make );

            } else {
                make();
            }

            return def;
        };
}.call( jar );
