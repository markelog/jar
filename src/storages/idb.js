!function() {
    if ( !jar.prefixes.indexedDB ) {
        return;
    }

    var proto, idb,
        self = this,
        database = {},
        counter = 0,
        indexOf = [].indexOf,

        cantStore = {
            xml: true,
            xsl: true, // Temp hack
            html: true
        },

        executable = {
            javascript: true,
            js: true,
            css: true
        },

        // Prefixes
        indexedDB = jar.prefixes.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB,
        IDBTransaction = jar.prefixes.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction,
        IDBKeyRange = jar.prefixes.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange,

        readwrite = IDBTransaction.READ_WRITE || "readwrite",
        readonly = IDBTransaction.READ_ONLY !== 0 ? "readonly" : 0;

    this.support.idb = true;

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
                idb.open = indexedDB.open( "jar", version() );
            }

            // In case we create instance without reopening connection to database
            if ( idb.db ) {
                self.instance.stores.idb = idb.db;
            }

            // New way to do it
            if ( idb.open.onupgradeneeded === null ) {
                request = setVersion(function() {
                    createObjectStore( name );

                }, this.instance );

                request.done(function() {
                    self.def.resolve();
                });

                request.fail( reject );

            // Old way
            } else {

                // If db exist than just update it
                if ( idb.db ) {
                    update( this );
                }

                // This will not execute if db already exist
                (request = idb.open).addEventListener( "success", function() {

                    // Create link in jar for new db
                    self.instance.stores.idb = idb.db = this.result;

                    update( self );
                });

                request.addEventListener( "error", reject );
            }

            return this;
        }
    };

    proto.init.prototype = proto;

    this.idb.set = function( name, data, type, id ) {
        var request, store,
            self = this;

        // We can't store DOM nodes
        if ( cantStore[ type ] ) {
            data = jar.text[ type ]( data );
        }

        data = {
            name: name,
            data: data
        };

        try {
            store = idb.db.transaction([ this.name ], readwrite ).objectStore( this.name );

            // Use "put", so we can rewrite data
            request = store.put( data );

        } catch ( _ ) {
            jar.reject( id );
            return this;
        }

        request.onsuccess = function() {
            jar.resolve( id, type, "idb" );
        };

        request.onerror = function() {
            jar.reject( id );
        };

        return this;
    };

    this.idb.get = function( name, type, id ) {
        var store, index, request,
            self = this;

        try {
            store = idb.db.transaction([ this.name ], readonly ).objectStore( this.name );
            index = store.index( "name" );
            request = index.get( name );

        } catch ( _ ) {
            jar.reject( id );
            return this;
        }

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
            if ( executable[ type ] ) {
                data = jar.filters[ type ]( data );
            }

            jar.resolve( id, data, type, "idb" );
        };

        request.onerror = function() {
            jar.reject( id );
        };

        return this;
    };

    this.idb.remove = function( name, id ) {
        var request, store,
            self = this;

        try {
            store = idb.db.transaction([ this.name ], readwrite ).objectStore( this.name );

            // Even though IE < 10 don't used this storage, it still raises exception
            // if we use delete method through dot notaion while parsing this code
            request = store[ "delete" ]( name );

        } catch ( _ ) {
            jar.reject( id );
            return this;
        }

        request.onsuccess = function() {
            jar.resolve( id );
        };

        request.onerror = function() {
            jar.reject( id );
        };

        return this;
    };

    this.idb.clear = function( id, destroy /* internal */ ) {
        var request, store, clear,
            stores = this.stores,
            self = this,
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
                if ( contains( name ) ) {
                    idb.db.deleteObjectStore( name );
                }
            }, this );

        } else {
            if ( contains( name ) ) {
                store = idb.db.transaction([ name ], readwrite ).objectStore( name );
                clear = store.clear();

                clear.addEventListener( "success", resolve );
                clear.addEventListener( "error", reject );
                return this;

            } else {
                resolve();
                return this;
            }
        }

        request.done( resolve ).fail( reject );

        return this;
    };

    function setVersion( success, instance, v ) {
        v = v || jar.Deferred();

        var state;

        // Old way to set database version
        if ( idb.db && idb.db.setVersion ) {
            state = idb.v && idb.v.state();

            // If we have active request – attach to it, if not – create new one
            if ( !idb.setVersion || idb.setVersion.readyState == "done" ) {

                // readystate might be "done", but it just means that versionchange transaction
                // was succesfull, it does not mean it was completed (wtf right?),
                // our deferred will be resolved only when everything is done
                if ( state != "pending" ) {
                    idb.setVersion = idb.db.setVersion( version() );

                } else {
                    idb.v.done(function() {
                        setVersion( success, instance, v );
                    });

                    // we should not do anything until versionchange transaction is not completed
                    return v;
                }
            }

            idb.setVersion.addEventListener( "success", function() {
                instance.stores.idb = idb.db = this.source;

                // We can change store only in versionchange transaction
                success();

                this.result.addEventListener( "complete", function() {

                    // But we cannot change version of base until it's not completed
                    v.resolve();
                });
            });

        } else {
            if ( idb.open.readyState == "pending" ) {
                idb.setVersion = idb.open;

            } else {
                idb.setVersion = indexedDB.open( "jar", version() );
            }

            idb.setVersion.addEventListener( "upgradeneeded", function() {
                instance.stores.idb = idb.db = this.result;
                success.apply( this, arguments );

                idb.setVersion.addEventListener( "success", function() {
                    v.resolve();
                });
            });
        }

        idb.setVersion.addEventListener( "success", function() {
            this.result.onversionchange = function() {
                this.close();
            };
        });

        idb.setVersion.addEventListener( "blocked", function() {
            if ( idb.db ) {
                idb.db.close();
            }
        });

        idb.setVersion.addEventListener( "error", function( a,b ) {
            v.reject();
        });

        return idb.v = v;
    }

    function update( instance ) {
        var request = setVersion(function() {
            createObjectStore( instance.name );
        }, instance.instance );

        request.done(function() {
            instance.def.resolve();

        }).fail(function() {
            instance.def.reject();
        });
    }

    function contains( name ) {
        return idb.db.objectStoreNames.contains( name );
    }

    function createObjectStore( name ) {
        if ( !contains( name ) ) {
            idb.db.createObjectStore( name, {
                keyPath: "name"
            }).createIndex( "name", "name", {
                unique: true
            });
        }
    }

    function version() {

        // IE6 is dead right?
        // In IE 10 we can't use new Date().getTime() or Date.now() for two reasons
        // 1) msindexedDB can't work with version highter than 9 sybmols number
        // 2) We can't use something that was not a number before, for example if
        // a = 2;
        // we can do – msIndexedDB.open( "test", a );
        // but we can't do msIndexedDB.open( "test", ++a );
        // or if a = "2"
        // we can't do msIndexedDB.open( "test", +a );
        if ( window.msIndexedDB ) {
            jar.iversion = window[ "eval" ]( ( +jar.iversion + 1 ).toString() );

        } else {
            jar.iversion = Date.now() + ( ++counter );
        }

        return jar.iversion;
    }
}.call( jar.fn );
