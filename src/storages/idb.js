!function() {
    var proto,
        self = this,
        database = {},
        indexOf = [].indexOf,

        // Prefixes
        indexedDB =  window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB,
        IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction,
        IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange

    this.idb = function( name ) {
        return new proto.init( name, this.instances );
    };

    proto = this.idb.prototype = {
        constructor: this.idb,

        init: function( name, instances ) {
            var db, request,
                self = this;

            this.version = 1;
            this.name = name;
            this.def = jar.Deferred();

            // Open connection with database
            request = indexedDB.open( "jar", this.version );

            this.def.done(function() {
                instances.idb = this;
            }, this );

            function reject() {
                self.def.reject();
            }

            // onupgradeneeded это новый эвент он есть только в Фаервоксе.
            // Хром использует устаревший (через setVersion) способ инициализации базы
            if ( request.onupgradeneeded === null ) {
                request.onupgradeneeded = function () {
                    self.setup();
                };

                request.onsuccess = function() {
                    self.db = this.result;
                    self.def.resolve();
                };

            } else {
                request.onsuccess = function() {
                    self.db = this.result;

                    if ( !~indexOf.call( this.result.objectStoreNames, self.name ) ) {
                        return self.setup();
                    }

                    self.def.resolve();
                }
            }

            request.onerror = function() {
                self.def.reject();
            };

            return this.def;
        },

        setup: function() {
            var request = this.db.setVersion( this.version ),
                name = this.name,
                db = this.db,
                def = this.def;

            request.onsuccess = function() {
                db.createObjectStore( name, {
                    keyPath: "name"
                }).createIndex( "name", "name", {
                    unique: true
                });
                def.resolve();
            };

            request.onfailure = function() {
                def.reject();
            };

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
            store = this.instances.idb.db.transaction([ this.name ], 1 /* Read-write */ ).objectStore( this.name ),

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
            store = this.instances.idb.db.transaction([ this.name ], 1 /* Read only */ ).objectStore( this.name ),
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
            store = this.instances.idb.db.transaction([ this.name ], 1 /* Read-write */ ).objectStore( this.name ),
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
            instance = this.instances.idb,
            db = instance.db;

        function reject() {
            jar.reject( id );
        }

        function resolve() {
            jar.resolve( id );
        }

        // Either clear or destroy
        if ( destroy ) {

            // Required for deleteObjectStore transaction
            request = db.setVersion( ++instance.version );
            request.onsuccess = function() {
                db.deleteObjectStore( name );

                resolve();
            };

        } else {
            store = this.instances.idb.db.transaction([ this.name ], 1 /* Read-write */ ).objectStore( this.name );
            request = store.clear();
            request.onsuccess = resolve;
        }

        request.onerror = reject;

        return this;
    };

}.call( jar.fn );