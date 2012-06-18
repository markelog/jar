!function() {
    var proto,
        requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem,
        Blob = window.BlobBuilder || window.WebKitBlobBuilder || window.Blob,
        types = {
            javascript: "text/javascript",
            text: "text/plain"
        };

    this.fs = function( name ) {
        return new proto.init( name, this.instances );
    };

    proto = this.fs.prototype = {
        constructor: this.fs,

        init: function( name, instances ) {
            this.name = name;
            this.def = jar.Deferred();

            this.def.done(function() {
                instances.fs = this;
            }, this );

            return this.setup().def;
        },

        setup: function() {
            var self = this,
                name = this.name,
                def = this.def;

            requestFileSystem( 0 /* Temporary */, 0, function( fs ) {
                (self.db = fs.root).getDirectory( name, {
                    create: true
                }, function( dir ) {
                    self.store = dir;
                    def.resolve();

                  }, def.reject );
                }, def.reject );

            return this;
        }
    };

    proto.init.prototype = proto;

    this.fs.set = function( name, data, type, id ) {
        function reject() {
            jar.reject( id );
        }

        this.instances.fs.store.getFile( name, {
            create: true
        }, function( entry ) {
            entry.createWriter(function( writer ) {
                var bb = new Blob();

                writer.onwriteend = function() {
                    jar.resolve( id );
                };

                writer.onerror = reject;

                bb.append( data );
                writer.write( bb.getBlob( types[ type ] ) );
            }, reject );
        }, reject );

        return this;
    };

    this.fs.get = function( name, type, id ) {
        function reject() {
            jar.reject( id );
        }

        this.instances.fs.store.getFile( name, {}, function( entry ) {
            entry.file(function( file ) {
                var reader = new FileReader();

                reader.onload = function() {
                    jar.resolve( id, this.result );
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

        this.instances.fs.store.getFile( name, {
            create: false
        }, function( entry ) {
            entry.remove(function() {
              jar.resolve( id );
            }, reject);
        }, reject );

        return this;
    };

    this.fs.clear = function( id, destroy ) {
        var instance = this.instances.fs,
            name = this.name;

        function reject() {
            jar.reject( id );
        }

        // Сама операция удаления
        this.instances.fs.store.removeRecursively(function() {

            if ( !destroy ) {

                // If we have to re-create the same dir
                instance.root.getDirectory( name, {
                    create: true
                }, function( dir ) {
                    instance.store = dir;

                    jar.resolve( id );
                }, reject );

            } else {
                jar.resolve( id );
            }
        }, reject );

        return this;
    };
}.call( jar.fn );