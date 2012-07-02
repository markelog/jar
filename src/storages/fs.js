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

        filters = {};
        filters.xml = function( base, name, id ) {
            var xhr = new XMLHttpRequest();
            xhr.open( "get", "filesystem:" + origin + "/temporary/" + base + "/" + name, false );
            xhr.send();

            if ( xhr.readyState === 4 ) {
                jar.resolve( id, xhr.responseXML || xhr.responseText, "xml", "fs" );

            } else {
                jar.reject( id );
            }
        };

    mime.js = mime.javascript;
    this.storages.push( "fs" );

    this.fs = function( name, instance ) {
        return new proto.init( name, instance );
    };

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
                def = this.def;

            function reject() {
                def.reject();
            }

            // Create root directory
            requestFileSystem( 0 /* Temporary */, 0, function( entry ) {
                (fs.db = entry.root).getDirectory( "jar", {
                    create: true
                }, function( dir ) {
                    self.instance.stores.fs = dir;

                    // Create sub dir, in it will be written all users files
                    dir.getDirectory( name, {
                        create: true
                    }, function( sub ) {
                        dir.sub = sub;

                        def.resolve();
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

        this.stores.fs.sub.getFile( name, {
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

        if ( filters[ type ] ) {
            filters[ type ]( this.name, name, id );
            return this;
        }

        this.stores.fs.sub.getFile( name, {}, function( entry ) {
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

        this.stores.fs.sub.getFile( name, {
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

        this.stores.fs.sub.removeRecursively(function( entry ) {

            if ( !destroy ) {

                // If we have to re-create the same dir
                fs.db.getDirectory( self.name, {
                    create: true
                }, function( dir ) {
                    self.stores.fs.sub = dir;

                    jar.resolve( id );
                }, reject );

            } else {
                jar.resolve( id );
            }

        }, reject );

        return this;
    };
}.call( jar.fn );