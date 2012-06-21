!function() {
    var proto, idb,
        self = this,
        database = {},
        indexOf = [].indexOf,

        cantStore = {
            xml: true,
            html: true
        },

        // Prefixes
        indexedDB =  window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB,
        IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction,
        IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;

    this.idb = function( name ) {
        return new proto.init( name, this.instances );
    };

    idb = jar.idb = {};

    proto = this.idb.prototype = {
        constructor: this.idb,

        init: function( name, instances ) {
            var db, request, def,
                self = this;

            this.name = name;

            if ( idb.db ) {

                // If previous deferred is finished, then create new deferred
                if ( idb.def.state != "pending" ) {
                    idb.def = jar.Deferred();
                    this.setup();

                } else {
                    // If base already opening or opened, wait when it will finish
                    idb.def.done(function() {
                        self.setup();
                    });
                }

                return idb.def;
            }

            def = idb.def = jar.Deferred();
            idb.version = 1;
            idb.setVersion = {
                readyState: 0
            };

            // Open connection for database
            idb.db = request = indexedDB.open( "jar", idb.version );

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
                    idb.db = this.result;

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
            if ( idb.setVersion.readyState != 1 ) {
                idb.setVersion = idb.db.setVersion( idb.version );
            }

            var request = idb.setVersion,
                name = this.name,
                db = idb.db,
                def = idb.def;

            request.addEventListener( "success", function() {
                if ( !db.objectStoreNames.contains( name ) ) {
                    db.createObjectStore( name, {
                        keyPath: "name"
                    }).createIndex( "name", "name", {
                        unique: true
                    });
                }

                idb.def.resolve();
            });

            request.addEventListener( "error", function() {
                def.reject();
            });

            return this;
        },
    };

    proto.init.prototype = proto;

    this.idb.set = function( name, data, type, id ) {
        var request,
            self = this,
            store = idb.db.transaction([ this.name ], 1 /* Read-write */ ).objectStore( this.name );

        // we can't store DOM nodes inside indexedDB
        if ( cantStore[ type ] ) {
            data = jar.text[ type ]( data );
        }

        data = {
            name: name,
            data: data
        };

        // use "put", so we can rewrite data
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
            store = idb.db.transaction([ this.name ], 0 /* Read only */ ).objectStore( this.name ),
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

            // IndexedDB can't store some types of data in it original type
            // we need to serialize it to right type
            if ( cantStore[ type ] ) {
                data = jar.filters[ meta.type ]( data );
            }

            // Some types of data can't be serialize to right type
            // like javascript code, so instead we return it like text
            // and execute it
            if ( jar.executable[ type ] ) {
                jar.filters[ type ]( data );
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
            store = idb.db.transaction([ this.name ], 1 /* Read-write */ ).objectStore( this.name ),
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
            db = idb.db;

        function reject() {
            jar.reject( id );
        }

        function resolve() {
            jar.resolve( id );
        }

        // Either clear or destroy
        if ( destroy ) {

            // Required for deleteObjectStore transaction
            request = idb.setVersion = idb.db.setVersion( ++idb.version );

            request.onsuccess = function() {
                db.deleteObjectStore( name );
                resolve();
            };

        } else {
            store = idb.db.transaction([ this.name ], 1 /* Read-write */ ).objectStore( this.name );
            request = store.clear();
            request.onsuccess = resolve;
        }

        request.onerror = reject;

        return this;
    };

}.call( jar.fn );