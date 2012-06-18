!function() {
    var proto,
        self = this,
        database = {},
        indexOf = [].indexOf,

        // Prefixes
        indexedDB =  window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB,
        IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction,
        IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;

    this.idb = function( name ) {
        return new proto.init( name, this.instances );
    };

    jar.idb = {};

    proto = this.idb.prototype = {
        constructor: this.idb,

        init: function( name, instances ) {
            var db, request, def,
                self = this;

            this.name = name;

            if ( jar.idb.db ) {

                // If previous deferred is finished, then create new deferred
                if ( jar.idb.def.state != "pending" ) {
                    jar.idb.def = jar.Deferred();
                    this.setup();

                } else {
                    // If base already opening or opened, wait when it will finish
                    jar.idb.def.done(function() {
                        self.setup();
                    });
                }

                return jar.idb.def;
            }

            def = jar.idb.def = jar.Deferred();
            jar.idb.version = 1;
            jar.idb.setVersion = {
                readyState: 0
            };

            // Open connection for database
            jar.idb.db = request = indexedDB.open( "jar", jar.idb.version );

            def.done(function() {
                instances.idb = this;
            }, this );

            function reject() {
                def.reject();
            }

            // onupgradeneeded это новый эвент он есть только в Фаервоксе.
            // Хром использует устаревший (через setVersion) способ инициализации базы
            if ( request.onupgradeneeded === null ) {
                request.onupgradeneeded = function () {
                    self.setup();
                };

                request.onsuccess = function() {
                    self.db = this.result;
                    def.resolve();
                };

            } else {
                request.onsuccess = function() {
                    jar.idb.db = this.result;

                    if ( !~indexOf.call( this.result.objectStoreNames, self.name ) ) {
                        return self.setup();
                    }

                    def.resolve();
                };
            }

            request.onerror = function() {
                def.reject();
            };

            return def;
        },

        setup: function() {
            if ( jar.idb.setVersion.readyState != 1 ) {
                jar.idb.setVersion = jar.idb.db.setVersion( jar.idb.version );
            }

            var request = jar.idb.setVersion,
                name = this.name,
                db = jar.idb.db,
                def = jar.idb.def;

            request.addEventListener( "success", function() {
                if ( !db.objectStoreNames.contains( name ) ) {
                    db.createObjectStore( name, {
                        keyPath: "name"
                    }).createIndex( "name", "name", {
                        unique: true
                    });
                }

                jar.idb.def.resolve();
            });

            request.addEventListener( "error", function() {
                def.reject();
            });

            return this;
        },
    };

    proto.init.prototype = proto;

    this.idb.set = function( name, data, type, id ) {
        data = {
            name: name,
            data: data
        };

        var self = this,
            store = jar.idb.db.transaction([ this.name ], 1 /* Read-write */ ).objectStore( this.name ),

            // put, so we can rewrite data
            request = store.put( data );

        request.onsuccess = function() {
            jar.resolve( id );
        };

        request.onerror = function() {
            jar.reject( id );
        };

        return this;
    };

    this.idb.get = function( name, type, id ) {
        var self = this,
            store = jar.idb.db.transaction([ this.name ], 0 /* Read only */ ).objectStore( this.name ),
            index = store.index( "name" ),
            meta = this.meta( name ),
            request = index.get( name );

        request.onsuccess = function() {
            var data = this.result && this.result.data;

            // when data is not found its a still succesfull operation
            // but not for us
            if ( !data ) {
                return jar.reject( id );
            }

            if ( jar.filters[ meta.type ] ) {
                jar.filters[ meta.type ]( data );
            }

            jar.resolve( id, data );
        };

        request.onerror = function() {
            jar.reject( id );
        };

        return this;
    };

    this.idb.remove = function( name, id ) {
        var self = this,
            store = jar.idb.db.transaction([ this.name ], 1 /* Read-write */ ).objectStore( this.name ),
            request = store.delete( name );

        request.onsuccess = function() {
            jar.resolve( id );
        };

        request.onerror = function() {
            jar.reject( id );
        };

        return this;
    };

    this.idb.clear = function( id, destroy /* internal */ ) {
        var request, store,
            name = this.name,
            db = jar.idb.db;

        function reject() {
            jar.reject( id );
        }

        function resolve() {
            jar.resolve( id );
        }

        // Either clear or destroy
        if ( destroy ) {

            // Required for deleteObjectStore transaction
            request = jar.idb.setVersion = jar.idb.db.setVersion( ++jar.idb.version );

            request.onsuccess = function() {
                db.deleteObjectStore( name );
                resolve();
            };

        } else {
            store = jar.idb.db.transaction([ this.name ], 1 /* Read-write */ ).objectStore( this.name );
            request = store.clear();
            request.onsuccess = resolve;
        }

        request.onerror = reject;

        return this;
    };

}.call( jar.fn );