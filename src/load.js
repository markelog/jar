!function() {
    function xhr( base, path, type ) {
        var def = jar.Deferred(),
            //request = new ( window.XMLHttpRequest, window.ActiveXObject )( "Microsoft.XMLHTTP" ); -- jshint :-(
            request = window.XMLHttpRequest ? new window.XMLHttpRequest() : new window.ActiveXObject( "Microsoft.XMLHTTP" );

        request.open( "get", path, true );
        request.send();

        request.onreadystatechange = function() {
             if ( request.readyState != 4 ) {
                    return;
                }

                if ( request.status >= 200 && request.status < 300 || request.status === 304 ) {
                    jar( base ).done(function() {
                        var data = type == "xml" ? request.responseXML : request.responseText;

                        jar.filters[ type ]( data );
                        def.resolve([ data, this ]);

                        this.set( path, data, type );
                    });

                } else {
                    def.reject();
                }
            };

        return def;
    }

    jar.load = function( path, base, type ) {
            var def, dots;

            if ( arguments.length != 3 ) {
                type = path.split( "." ).pop();
            }

            base = base || "jar";

            if ( jar.has( base, path ) ) {
                def = jar.Deferred();

                jar( base ).done(function() {
                    this.get( path ).done(function( data ) {
                        def.resolve([ data, this ]);
                    });
                });

                return def;
            }

            return xhr( base, path, type );
        };
}.call( jar );
