!function() {
    var proto,
        database = {},
        indexOf = [].indexOf,
        self = this;

    this.idb = function( name ) {
        return new proto.init( name, this.instances );
    };

    proto = this.idb.prototype = {
        constructor: this.idb,

        init: function( name, instances ) {
            var db,

                self = this,

                version = 1,

                // Open connection with database
                request = jar.prefixes.indexedDB.open( "jar", version );

            this.name = name;
            this.def = jar.Deferred();

            this.def.done(function() {
                instances.idb = this;
            }, this );

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
                    (self.db = this.result).setVersion( version ).onsuccess = function() {
                        self.setup();
                    };
                };
            }

            return this.def;
        },

        setup: function() {
            if ( !~indexOf.call( this.db.objectStoreNames, this.name ) ) {
                this.db.createObjectStore( this.name, {
                    keyPath: "name"
                }).createIndex( "name", "name", {
                    unique: true
                });
            }

            this.store = this.db.transaction([ this.name ], 1 /* Read-write */ ).objectStore( this.name );
            this.def.resolve();

            return this;
        }
    };

    proto.init.prototype = proto;

    this.idb.set = function( name, data, type, id ) {
        data = {
            name: name,
            data: data
        };

        var self = this,
            store = this.instances.idb.store,
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
            index = this.instances.idb.store.index( "name" ),
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
            request = this.instances.idb.store.delete( name );

        request.onsuccess = function() {
            jar.resolve( id );
        };

        request.onerror = function() {
            jar.reject( id );
        };

        return this;
    };
}.call( jar.fn );