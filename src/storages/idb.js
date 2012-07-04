!function() {
    if ( !jar.prefixes.indexedDB ) {
        return;
    }

    var proto, idb,
        self = this,
        database = {},
        indexOf = [].indexOf,

        cantStore = {
            xml: true,
            html: true
        },

        // Prefixes
        indexedDB = jar.prefixes.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB,
        IDBTransaction = jar.prefixes.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction,
        IDBKeyRange = jar.prefixes.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;

    this.storages.push( "idb" );

    this.idb = function( name ) {
        return new proto.init( name, this );
    };

    idb = jar.idb = {};

    proto = this.idb.prototype = {
        constructor: this.idb,

        init: function( name, instance ) {
            var db, request, def,
                self = this;

            this.instance = instance;
            this.def = jar.Deferred();
            this.name = name;

            return this.setup().def;
        },

        setup: function() {
            var request,
                self = this,
                name = this.name;

            function reject() {
                self.def.reject();
            }

            // If db already initialized don't try to create another one
            if ( !idb.open ) {

                // Open connection for database
                idb.open = indexedDB.open( "jar", jar.version = new Date().getTime() );
            }

            // In case we create instance without reopening connection to database
            if ( idb.db ) {
                self.instance.stores.idb = idb.db;
            }

            // New way to do it
            if ( idb.open.onupgradeneeded === null ) {

                request = setVersion(function() {
                    self.instance.stores.idb = idb.db = this.result;
                    createObjectStore( name );
                }, this.instance );

                request.addEventListener( "success", function() {
                    self.def.resolve();
                });

            // Old way
            } else {

                // If db exist than just update it
                if ( idb.db ) {
                    update( this );
                }

                // This will not be executed if db already exist
                (request = idb.open).addEventListener( "success", function() {

                    // Create link in jar for new db
                    self.instance.stores.idb = idb.db = this.result;

                    update( self );
                });
            }

            request.addEventListener( "error", reject );
            request.addEventListener( "blocked", reject );

            return this;
        },
    };

    proto.init.prototype = proto;

    this.idb.set = function( name, data, type, id ) {

        // Reject request if store is not exist
        if ( !contains( this.name ) ) {
            jar.reject( id );
            return this;
        }

        var request,
            self = this,
            store = idb.db.transaction([ this.name ], IDBTransaction.READ_WRITE ).objectStore( this.name );

        // We can't store DOM nodes
        if ( cantStore[ type ] ) {
            data = jar.text[ type ]( data );
        }

        data = {
            name: name,
            data: data
        };

        // Use "put", so we can rewrite data
        request = store.put( data );

        request.onsuccess = function() {
            jar.resolve( id, type, "idb" );
        };

        request.onerror = function() {
            jar.reject( id );
        };

        return this;
    };

    this.idb.get = function( name, type, id ) {

        // Reject request if store is not exist
        if ( !contains( this.name ) ) {
            jar.reject( id );
            return this;
        }

        var self = this,
            store = idb.db.transaction([ this.name ], IDBTransaction.READ_ONLY ).objectStore( this.name ),
            index = store.index( "name" ),
            request = index.get( name );

        request.onsuccess = function() {
            var data = this.result && this.result.data;

            // When data isn't there its still succesfull operation for this api, but not for jar
            if ( !data ) {
                return jar.reject( id );
            }

            // IndexedDB can't store some types of data in it original type
            // we need to serialize it to right type
            if ( cantStore[ type ] ) {
                data = jar.filters[ type ]( data );
            }

            // Some types of data can't be serialize to right type
            // like javascript code, so instead we return it like text
            // and execute it
            if ( jar.executable[ type ] ) {
                jar.filters[ type ]( data );
            }

            jar.resolve( id, data, type, "idb" );
        };

        request.onerror = function() {
            jar.reject( id );
        };

        return this;
    };

    this.idb.remove = function( name, id ) {

        // Reject request if store is not exist
        if ( !contains( this.name ) ) {
            jar.reject( id );
            return this;
        }

        var self = this,
            store = idb.db.transaction([ this.name ], IDBTransaction.READ_WRITE ).objectStore( this.name ),
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
            stores = this.stores,
            name = this.name;

        function resolve() {
            jar.resolve( id );
        }

        function reject() {
            jar.reject( id );
        }

        // Either clear or destroy
        if ( destroy ) {
            request = setVersion(function() {
                idb.db.deleteObjectStore( name );
            }, this );

        } else {
            store = idb.db.transaction([ name ], IDBTransaction.READ_WRITE ).objectStore( name );
            request = store.clear();
        }

        request.onsuccess = resolve;
        request.onerror = reject;

        return this;
    };

    var test = [];

    function setVersion( fn, instance ) {

        // Old way to set database version
        if ( idb.db && idb.db.setVersion ) {

            // If we have active request attach to it, if not create new one
            if ( !idb.setVersion || idb.setVersion.readyState == 2 /* done */ ) {
                idb.setVersion = idb.db.setVersion( new Date().getTime() );
            }

            idb.setVersion.addEventListener( "success", fn );

        } else {
            if ( idb.open.readyState == "pending" ) {
                idb.setVersion = idb.open;

            } else {
                idb.db.close();
                idb.setVersion = indexedDB.open( "jar", jar.version = new Date().getTime() );
            }

            idb.setVersion.addEventListener( "upgradeneeded", function() {
                instance.stores.idb = idb.db = this.result;
                fn.apply( this, arguments );
            });
        }

        idb.setVersion.addEventListener( "success", function() {
            this.result.onversionchange = function() {
                this.close();
            };
        });

        return idb.setVersion;
    }

    function update( instance ) {
        var request = setVersion(function() {
            createObjectStore( instance.name );
        });

        request.addEventListener( "success", function() {
            instance.def.resolve();
        });

        request.addEventListener( "error", function() {
            instance.def.reject();
        });
    }

    function contains( name ) {
        return idb.db.objectStoreNames.contains( name );
    }

    function createObjectStore( name ) {
        if ( !idb.db.objectStoreNames.contains( name ) ) {
            idb.db.createObjectStore( name, {
                keyPath: "name"
            }).createIndex( "name", "name", {
                unique: true
            });
        }
    }

}.call( jar.fn );