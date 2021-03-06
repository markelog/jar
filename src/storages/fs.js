!function() {

    // Currently, if browser (Chrome don't have Quota Management API) then it
    // don't have Filesystem API, but if some browser (Firefox) will add it,
    // it might ask users permission to work with FS, which is not so cool,
    // but if storageInfo will be implemented it would not have to ask anything
    if ( !jar.prefixes.storageInfo ) {
        return;
    }

    var proto, fs,
        requestFileSystem = jar.prefixes.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem,
        Blob = jar.prefixes.Blob = window.BlobBuilder || window.WebKitBlobBuilder || window.Blob,
        mime = {
            javascript: "application/javascript",
            xml: "application/xml",
            html: "text/html",
            text: "text/plain"
        },

        origin = window.location.origin,

        filters = {
            xml: function( base, name, id ) {
                var xhr = new window.XMLHttpRequest();

                xhr.open( "get", "filesystem:" + origin + "/temporary/jar/" + base + "/" + name, true );
                xhr.send();

                xhr.onreadystatechange = function() {
                    if ( xhr.readyState != 4 ) {
                        return;
                    }

                    if ( xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 ) {
                        jar.resolve( id, xhr.responseXML, "xml", "fs" );

                    } else {
                        jar.reject( id );
                    }
                };
            }
        };

        // If css will be applied through link inclusion all paths for images
        // will be relative to this file, which is stored in filesystem
        // we enable this future only if user really sure he can use it
        if ( jar.fsCSS ) {
            filters.css = function( base, name, id ) {
                var link = document.createElement( "link" );
                link.href = "filesystem:" + origin + "/temporary/jar/" + base + "/" + name;
                link.rel = "stylesheet";
                link.type = "text/css";

                link.addEventListener( "error", function() {
                    jar.reject( id );
                });

                link.addEventListener( "load", function() {

                    // Potential danger
                    window.setTimeout(function() {
                        jar.resolve( id, link, "css", "fs" );
                    }, 10 );
                });

                document.head.appendChild( link );
            };
        }

    mime.js = mime.javascript;

    this.support.fs = true;

    this.fs = function( name, instance ) {
        return new proto.init( name, instance );
    };

    this.fs.filters = filters;
    fs = jar.fs = {};

    proto = this.fs.prototype = {
        constructor: this.fs,

        init: function( name, instance ) {
            this.name = name;
            this.instance = instance;
            this.def = jar.Deferred();

            return this.setup().def;
        },

        setup: function() {
            var self = this,
                name = this.name,
                stores = this.instance.stores,
                def = this.def;

            function reject() {
                def.reject();
            }

            // Create root directory
            requestFileSystem( 0 /* Temporary */, 0, function( entry ) {
                entry.root.getDirectory( "jar", {
                    create: true
                }, function( dir ) {

                    // Create sub dir, in it will be written all users files
                    ( fs.db = dir ).getDirectory( name, {
                        create: true
                    }, function( sub ) {
                        stores.fs = jar.fs.sub = sub;

                        def.resolve();

                    }, function () {
                        def.reject();
                    });

                }, reject );
            }, reject );

            return this;
        }
    };

    proto.init.prototype = proto;

    this.fs.set = function( name, data, type, id ) {
        function reject() {
            jar.reject( id );
        }

        name = name.replace( /\//g, "|" );

        this.stores.fs.getFile( name, {
            create: true
        }, function( entry ) {
            entry.createWriter(function( writer ) {
                var bb = new Blob();

                writer.onwriteend = function() {
                    jar.resolve( id, type, "fs" );
                };

                writer.onerror = reject;

                // We can write only strings in Blob
                if ( typeof data != "string" ) {
                    data = jar.text[ type ]( data );
                }

                bb.append( data );
                writer.write( bb.getBlob( mime[ type ] ) );
            }, reject );
        }, reject );

        return this;
    };

    this.fs.get = function( name, type, id ) {
        function reject() {
            jar.reject( id );
        }

        var meta = this.meta( name );
        type = meta && meta.type;

        name = name.replace( /\//g, "|" );

        if ( filters[ type ] ) {
            filters[ type ]( this.name, name, id );
            return this;
        }

        this.stores.fs.getFile( name, {}, function( entry ) {
            entry.file(function( file ) {
                var reader = new FileReader();

                reader.onload = function() {
                    jar.resolve( id, jar.filters[ type ]( this.result ), type, "fs" );
                };

                reader.onerror = reject;

                reader.readAsText( file );
            }, reject );
        }, reject );

        return this;
    };

    this.fs.remove = function( name, id ) {
        function reject() {
            jar.reject( id );
        }

        this.stores.fs.getFile( name, {
            create: false
        }, function( entry ) {

            entry.remove(function() {
              jar.resolve( id );

            }, reject);
        }, reject );

        return this;
    };

    this.fs.clear = function( id, destroy ) {
        var self = this;

        function reject() {
            jar.reject( id );
        }

        if ( this.stores.fs ) {
            this.stores.fs.removeRecursively(function( entry ) {
                if ( !destroy ) {

                    // If we have to re-create the same dir
                    jar.fs.db.getDirectory( self.name, {
                        create: true
                    }, function( dir ) {
                        self.stores.fs = dir;

                        jar.resolve( id );
                    }, reject );

                } else {
                    delete self.stores.fs;
                    jar.resolve( id );
                }

            }, reject );
        } else {
            jar.resolve( id );
        }

        return this;
    };
}.call( jar.fn );