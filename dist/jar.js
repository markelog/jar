/*
* jar
*
*
* Copyright (c) 2012 Oleg
* Licensed under the MIT, GPL licenses.
*/

!function() {
    var jar,
        rstoreNames = /[^\w]/g,
        storageInfo = window.storageInfo || window.webkitStorageInfo,
        toString = "".toString,
        sqlLc = [ "sql", "lc" ],
        order = {
            xml: sqlLc,
            html: sqlLc,
            json: sqlLc,
            javascript: sqlLc,
            css: sqlLc,
            text: sqlLc
        };

    // Firefox ask user permission to use indexedDb, because of this we don't use it in FF
    if ( storageInfo ) {
        order.xml = [ "fs", "idb" ].concat( order.xml );
        order.json = [ "idb" ].concat( order.json );
        order.javascript = [ "fs" ].concat( order.javascript );
        order.javascript = [ "css" ].concat( order.javascript );
        order.text = [ "idb", "lc" ];

    } else if ( window.msIndexedDB ) {
        order.xml = [ "idb" ].concat( order.xml );
        order.json = [ "idb" ].concat( order.json );
        order.javascript = [ "idb" ].concat( order.javascript );
        order.css = [ "css" ].concat( order.css );
        order.text = [ "idb", "lc" ];
    }

    order.js = order.javascript;
    jar = this.jar = function jar( name, storage ) {
        return new jar.fn.init( name, storage );
    };

    jar.order = order;

    jar.prefixes = {
        storageInfo: storageInfo
    };

    jar.prototype = this.jar.fn = {
        constructor: jar,

        version: 0,

        storages: [],
        types: [ "xml", "html", "javascript", "js", "css", "text", "json" ],

        init: function( name, storage ) {

            // Name of a object store must contain only alphabetical symbols
            this.name = name ? name.replace( rstoreNames, "repl" ) : "jar";
            this.deferreds = {};
            this.stores = {};

            if ( !storage ) {
                this.order = jar.order;
            }

            // TODO – add support for aliases
            return this.setup( storage || this.storages );
        },

        // Setup for all storages
        setup: function( storages ) {
            this.storages = storages = storages.split ? storages.split(" ") : storages;

            var storage,
                def = this.register(),
                defs = [];

            // Jar store meta-info in lc, if we don't have it – reject call
            if ( !window.localStorage ) {
                def.reject();
                return this;
            }

            // Initiate all storages that we can work with
            for ( var i = 0, l = storages.length; i < l; i++ ) {
                storage = storages[ i ];

                // This check needed if user explicitly specified storage that
                // he wants to work with, whereas browser don't implement it
                if ( this[ storage ] ) {

                    // Initiate storage
                    defs.push( this[ storage ]( this.name, this ) );

                    // Initiate meta-data for this storage
                    this.log( storage );
                }
            }

            if ( !this.order ) {
                this.order = {};

                for ( i = 0, l = this.types.length; i < l; i++ ) {
                    this.order[ this.types[ i ] ] = storages;
                }
            }

            jar.when.apply( jar, defs )
                .done(function() {
                    def.resolve();
                })
                .fail(function() {
                    def.reject();
                });

            return this;
        }
    };

    jar.fn.init.prototype = jar.fn;

    jar.has = function( base, name ) {
        return !!jar.fn.meta( name, base.replace( rstoreNames, "repl" ) );
    };
}.call( window );
!function() {
    var xml,
        head = document.head || document.getElementsByTagName( "head" )[ 0 ],
        gEval = window.execScript || eval;

    if ( window.XMLSerializer ) {
        xml = function( node ) {
            if ( typeof node != "string" ) {
                return node.xml || new window.XMLSerializer().serializeToString( node );
            }

            return node;
        };

    // Old IE
    } else {

        // We can receive string as an argument, if we do, just return the same argument
        xml = function( node ) {
            return node.xml ? node.xml : node.outerHTML || node;
        };
    }

    this.filters = {
        json: JSON.parse,

        javascript: function( data ) {
            gEval( data );
            return data;
        },

        css: function( data ) {
            var style = document.createElement( "style" );

            if ( style.styleSheet === undefined ) {
                style.innerHTML = data;

            // for IE
            } else {
                style.type = "text/css";
                style.styleSheet.cssText = data;
            }

            head.appendChild( style );
            return data;
        },

        // from jQuery
        xml: function( data ) {
            var xml;

            if ( typeof data !== "string" || !data ) {
                return null;
            }

            try {
                if ( window.DOMParser ) {
                    xml = new window.DOMParser().parseFromString( data , "text/xml" );

                } else { // IE

                    xml = new window.ActiveXObject( "Microsoft.XMLDOM" );
                    xml.async = "false";
                    xml.loadXML( data );
                }
            } catch( _ ) {}

            if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
                throw "Invalid XML: " + data;
            }

            return xml;
        },

        text: window.String,

        html: function() {
            var doc = document.createElement( "div" );

            return function( data ) {
                doc.innerHTML = data;

                return doc.firstChild;
            };
        }()
    };

    this.filters.js = this.filters.javascript;

    this.text = {
        json: JSON.stringify,
        xml: xml,
        text: window.String
    };

    this.text.js = this.text.javascript = this.text.css = this.text.text;
    this.text.html = this.text.xml;

    jar.type = function( data ) {
        var documentElement, nodeName;

        if ( typeof data == "string" ) {
            return "text";
        }

        if ( !data ) {
            return;
        }

        documentElement = ( data.ownerDocument || data ).documentElement;
        nodeName = documentElement && documentElement.nodeName.toLowerCase();

        if ( nodeName ) {
            if ( nodeName !== "html" ) {
                return "xml";
            }

            return "html";
        }

        if ( typeof data == "object" ) {
            return "json";
        }

        return "text";
    };

}.call( jar );
!function() {
    this.prefixes = {
        requestFileSystem: window.requestFileSystem || window.webkitRequestFileSystem,

        storageInfo: window.storageInfo || window.webkitStorageInfo,

        Blob: window.BlobBuilder || window.WebKitBlobBuilder || window.Blob,

        // IndexedDB prefixes
        indexedDB: window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB,
        IDBTransaction: window.IDBTransaction || window.webkitIDBTransaction,
        IDBKeyRange: window.IDBKeyRange || window.webkitIDBKeyRange
    };

    this.prefixes.idb = this.prefixes.indexedDB;
    this.prefixes.lc = localStorage;

}.call( jar );
!function() {
    var proto,
        counter = 0,
        slice = [].slice;

    function Deferred() {
        this.lists = {
            done: [],
            fail: [],
            always: []
        };

        // Total amount of called callbacks
        this.length = 0;
        this.state = "pending";

        return this;
    }

    Deferred.prototype = {
        constructor: Deferred,

        add: function( type, fn, context ) {
            var state;
            context = context || jar;

            if ( !fn ) {
                return this;
            }

            if ( !this.args ) {
                this.args = [];
            }

            if ( this.state != "pending" ) {
                if ( this.state == "resolved" && type == "done" ) {
                   fn.apply( context, this.args );
                   return this;
                }

                if ( this.state == "rejected" && type == "fail" ) {
                    fn.apply( context, this.args );
                    return this;
                }

                if ( type == "always" ) {
                    fn.apply( context, this.args );
                }
            }

            this.lists[ type ].push({
                fn: fn,
                context: context
            });

            return this;
        },

        iterate: function( type, args, i /* internal */ ) {
            var value, always,
                isAlways = type == "always";

            i = i || 0;
            args = args || [];
            type = this.lists[ type ];

            for ( var l = type.length; i < l; i++ ) {
                value = type[ i ];

                value.fn.apply( value.context || this, args );

                // call "always" callback
                if ( !isAlways && ( always = this.lists.always[ i ] ) ) {
                    always.fn.apply( value.context || this, args );
                }
            }

            // If successful or failed callbacks is less then "always" callbacks
            // some of the always callbacks will not be called
            if ( i < this.lists.always.length ) {
                this.iterate( "always", args, i );
            }

            return this;
        },

        resolve: function( args ) {
            if ( this.state == "pending" ) {
                this.state = "resolved";
                this.iterate( "done", this.args = args );
            }

            return this;
        },

        reject: function( args ) {
            if ( this.state == "pending" ) {
                this.state = "rejected";
                this.iterate( "fail", this.args = args );
            }

            return this;
        },

        done: function( fn, context ) {
            return this.add( "done", fn, context || this.context );
        },

        always: function( fn, context ) {
            return this.add( "always", fn, context || this.context );
        },

        fail: function( fn, context ) {
            return this.add( "fail", fn, context || this.context );
        },

        then: function( success, error, context ) {
            if ( typeof error == "function" ) {
                this.add( "done", success, context || this.context )
                    .add( "fail", error, context || this.context );

            } else {
                this.add( "done", success, error || this.context );
            }

            return this;
        }
    };

    this.Deferred = function() {
        return new Deferred();
    };

    this.when = function() {
        var def = jar.Deferred(),
            defs = arguments,
            executed = 0,
            args = [],
            length = defs.length;

        def.context = this;

        if ( !length ) {
            return def.resolve();
        }

        function done( index, doneArgs ) {
            args[ index ] = slice.call( doneArgs );

            if ( def.state == "pending" && length == ++executed ) {
                def.resolve( args );
            }
        }

        function reject() {
            def.reject( slice.call( arguments ) );
        }

        function loop( i ) {
            return function() {
                done( i, arguments );
            };
        }

        for ( var i = 0; i < length; i++ ) {
            defs[ i ].always( loop( i ), this ).fail( reject, this );
        }

        return def;
    };

    this.resolve = function( def ) {
        var id = typeof def == "object" ? def.id : def,
            args = slice.call( arguments );

        def = this.deferreds[ id ];

        args.shift();
        delete this.deferreds[ id ];

        return def.resolve( args );
    };

    this.reject = function( def ) {
        var id = typeof def == "object" ? def.id : def,
            args = slice.call( arguments );

        def = this.deferreds[ id ];

        args.shift();

        delete this.deferreds[ id ];
        return def.reject( args );
    };

    this.fn.register = function() {
        var id = new Date().getTime() + (++counter);

        // FIXME Deferreds in this.deferreds stored almost forever
        this.active = this.deferreds[ id ] = jar.deferreds[ id ] = jar.Deferred();

        this.active.id = id;

        return this.active;
    };

    this.fn.done = function( fn, context ) {
        this.active.add( "done", fn, context || this );
        return this;
    };

    this.fn.fail = function( fn, context ) {
        this.active.add( "fail", fn, context || this );
        return this;
    };

    this.fn.always = function( fn, context ) {
        this.active.add( "always", fn, context || this );
        return this;
    };

    this.fn.then = function() {
        this.active.then.apply( this.active, arguments );
        return this;
    };

    this.deferreds = {};

    this.fn.promise = function() {
        var def = jar.Deferred(),
            defs = [];

        for ( var id in this.deferreds ) {
            def = this.deferreds[ id ];

            if ( def.state == "pending" ) {
                defs.push( def );

            } else {
                delete this.deferreds[ id ];
            }
        }

        return jar.when.apply( this, defs );
    };
}.call( jar );
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

            // Quick hack, should be changed
            if ( type == "xsl" ) {
                type = "xml";
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

!function() {
    var lc = localStorage,
        data = lc[ "jar-meta" ];

    jar.data = data = data ? jar.filters.json( data ) : {};
    jar.iversion = lc[ "jar-iversion" ] || 1;

    if ( !data._meta ) {
        data._meta = {};
    }

    function unload() {
        lc[ "jar-meta" ] = jar.text.json( jar.data );
        lc[ "jar-iversion" ] = jar.iversion;
    }

    if ( window.onbeforeunload == null ) {
        if ( window.addEventListener ) {
            window.addEventListener( "beforeunload", unload, false );
        } else {
            window.attachEvent( "beforeunload", unload );
        }
    } else {
        window.history.navigationMode = "compatible";
        window.addEventListener( "unload", unload, false );
    }

    // Log meta-data
    this.log = function( name, storage, type ) {
        var data, meta;

       if ( !jar.data._meta[ this.name ] ) {
            jar.data[ this.name ] = {};

            jar.data._meta[ this.name ] = {
                storages: {},
                length: 0
            };
        }

        meta = jar.data._meta[ this.name ];
        data = jar.data[ this.name ];

        // Check for name if we have to only initiate storage
        if ( storage ) {
            data[ name ] = {
                storage: storage,
                type: type
            };

            meta.length++;

        } else {
            storage = name;
        }

        // Remember total amounts of keys that uses this type of storages
        if ( !meta.storages[ storage ] ) {
            meta.storages[ storage ] = 0;
        }

        meta.storages[ storage ]++;

        return this;
    };

    // Remove meta-data
    this.removeRecord = function( name ) {
        var storage,
            data = jar.data[ this.name ],
            meta = jar.data._meta[ this.name ];

        if ( !data ) {
            return this;
        }

        storage = meta.storages;

        delete data[ name ];

        // If data is equal to zero we still no removing data-store
        meta.length--;

        // But we remove info about storages
        if ( !--meta.storages[ storage ] ) {
            delete meta.storages[ storage ];
        }

        return this;
    };

    // Get meta-data
    this.meta = function( name, base /* internal */ ) {
        var data;
        if ( data = jar.data[ base || this.name ] ) {
            return data[ name ];
        }
    };
}.call( jar.fn );
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
                idb.open = indexedDB.open( "jar", version() );
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
            return this;
        }
    };

    proto.init.prototype = proto;

    this.idb.set = function( name, data, type, id ) {

        // Reject request if store is not exist
        if ( !contains( this.name ) ) {
            jar.reject( id );
            return this;
        }

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

        // Reject request if store is not exist
        if ( !contains( this.name ) ) {
            jar.reject( id );
            return this;
        }

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
        var request, store,
            stores = this.stores,
            name = this.name;

        function resolve() {
            jar.resolve( id );
        }

        function reject() {
            jar.reject( id );
        }

        try {

            // Either clear or destroy
            if ( destroy ) {
                request = setVersion(function() {
                    idb.db.deleteObjectStore( name );
                }, this );

            } else {
                store = idb.db.transaction([ name ], readwrite ).objectStore( name );
                request = store.clear();
            }

            request.onsuccess = resolve;
            request.onerror = reject;

        } catch ( _ ) {
            reject();
        }

        return this;
    };

    function setVersion( fn, instance ) {

        // Old way to set database version
        if ( idb.db && idb.db.setVersion ) {

            // If we have active request attach to it, if not create new one
            if ( !idb.setVersion || idb.setVersion.readyState == 2 /* done */ ) {
                idb.setVersion = idb.db.setVersion( version() );
            }

            idb.setVersion.addEventListener( "success", fn );

        } else {
            if ( idb.open.readyState == "pending" ) {
                idb.setVersion = idb.open;

            } else {
                idb.setVersion = indexedDB.open( "jar", version() );
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

        idb.setVersion.addEventListener( "blocked", function() {
            if ( idb.db ) {
                idb.db.close();
            }
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

        request.addEventListener( "blocked", function() {
            instance.def.reject();
        });

        request.addEventListener( "error", function() {
            instance.def.reject();
        });
    }

    function contains( name ) {
        return idb.db && idb.db.objectStoreNames.contains( name );
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

        name = name.replace( /\//g, "|" );

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

        name = name.replace( /\//g, "|" );

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
!function() {
    var lc = window.localStorage,
        slice = [].slice;

    if ( !lc ) {
        return;
    }

    this.storages.push( "lc" );

    // Use case for async and sync interfaces should be identical
    // We have to make sync localStorage interface to an async

    function finish( name ) {
        var args = slice.call( arguments );
        args.shift();

        window.setTimeout(function() {
            jar[ name ].apply( jar, args );
        });
    }

    this.lc = function() {
        var def = jar.Deferred();

        // Make sync interface is async
        window.setTimeout(function() {
            def.resolve();
        });

        return def;
    };

    this.lc.set = function( name, data, type, id ) {
        try {
            lc[ "jar-value-" + this.name + "-" + name ] = jar.text[ type ]( data );
            finish( "resolve", id, type, "lc" );

        } catch ( e ) {
            finish( "reject", id );
        }

        return this;
    };

    this.lc.get = function( name, type, id ) {
        type = type || this.meta( name ).type;

        var data, meta;

        try {
            data = lc[ "jar-value-" + this.name + "-" + name ];

            if ( data !== undefined ) {
                finish( "resolve", id, jar.filters[ type ]( data ), type, "lc" );

            // If we have no data
            } else {
                finish( "reject", id );
            }
        } catch ( e ) {
            finish( "reject", id );
        }

        return this;
    };

    this.lc.remove = function( name, id ) {
        try {
            lc.removeItem( "jar-value-" + this.name + "-" + name );
            finish( "resolve", id );

        } catch ( e ) {
            finish( "reject", id );
        }

        return this;
    };

    this.lc.clear = function( id ) {
        var reg,
            self = this,
            defs = [],
            data = jar.data[ this.name ];

        function executer( key ) {
            return function() {
                this.removeRecord( key );
            };
        }

        for ( var key in data ) {
            reg = this.register();
            defs.push( reg );

            this.lc.remove.apply( this, [ key, reg.id ] );

            reg.done( executer( key ), this );
        }

        setTimeout(function() {
            jar.when.apply( self, defs )
                .done(function() {
                    jar.resolve( id );
                })
                .fail(function() {
                    jar.reject( id );
                });
        });

        return this;
    };
}.call( jar.fn );
!function() {
    var proto, sql;

    if ( !window.openDatabase ) {
        return;
    }

    this.storages.push( "sql" );

    this.sql = function( name, instance ) {
        return new proto.init( name, instance );
    };

    proto = this.sql.prototype = {
        constructor: this.sql,

        init: function( name, instance ) {
            this.name = name;
            this.def = jar.Deferred();

            return this.setup().def.done(function() {
                instance.stores.sql = this.db;
            }, this );
        },

        setup: function() {
            var def = this.def,
                command = "CREATE TABLE IF NOT EXISTS " + this.name + "(name TEXT PRIMARY KEY ASC, data TEXT)";

            function resolve() {
                def.resolve();
            }

            function reject() {
                def.reject();
            }

            this.db = window.openDatabase( "jar", "1", "jar Database", 0 );
            this.db.transaction(function( trans ) {

                // have to use variable for command, can't use an expression
                trans.executeSql( command, [], resolve, reject );
            });

            return this;
        }
    };

    proto.init.prototype = proto;

    this.sql.set = function( name, data, type, id ) {
        var update = "UPDATE " + this.name + " SET data = ? WHERE name = ?",
            insert = "INSERT INTO " + this.name + "(data, name) VALUES(?, ?)",
            store = this.stores.sql;

        // We can store only text
        data = jar.text[ type ]( data );

        function resolve() {
            jar.resolve( id, type, "sql" );
        }

        function reject() {
            jar.reject( id );
        }

        store.transaction(function( trans ) {

            // Try to add data, if transaction will fall then try to update it
            trans.executeSql( insert, [ data, name ], resolve, function() {

                // Can't re-use transaction in Opera
                store.transaction(function( trans ) {
                    trans.executeSql( update, [ data, name ], resolve, reject );
                });
            });
        });

        return this;
    };

    this.sql.get = function( name, type, id ) {
        var command = "SELECT data FROM " + this.name + " WHERE name = '" + name + "'";
        var self = this;

        function resolve( trans, result ) {
            result = result.rows;

            // when data isn't there its still succesfull operation, but not for us
            if ( result.length != 1 ) {
                return jar.reject( id );
            }

            jar.resolve( id, jar.filters[ type ]( result.item( 0 ).data ), type, "sql" );
        }

        function reject() {
            jar.reject( id );
        }

        this.stores.sql.transaction(function( trans ) {
            trans.executeSql( command, [], resolve, reject );
        });

        return this;
    };

    this.sql.remove = function( name, id ) {
        var command = "DELETE FROM " + this.name + "WHERE name = ?";

        function resolve() {
            jar.resolve( id );
        }

        function reject() {
            jar.reject( id );
        }

        this.stores.sql.transaction(function( trans ) {
            trans.executeSql( command, [ name ], resolve, reject );
        });

        return this;
    };

    this.sql.clear = function( id, destroy ) {
        var self = this,
            command = destroy ? "DROP TABLE " + this.name : "DELETE FROM " + this.name;

        function resolve() {
            jar.resolve( id );
        }

        function reject() {
            jar.reject( id );
        }

        this.stores.sql.transaction(function( trans ) {
            trans.executeSql( command, [], resolve, reject );
        });

        return this;
    };
}.call( jar.fn );
!function () {
    this.set = function( name, data, type ) {
        type = type || jar.type( data );

        var storage, storages,
            reg = this.register();

        // Reject request if storage is not exist
        if ( !this.order ) {
            setTimeout(function() {
                reg.reject();
            });

            return this;
        }

        storages = this.order[ type ];

        for ( var i = 0, l = this.order[ type ].length; i < l; i++ ) {
            storage = storages[ i ];

            if ( this[ storages[ i ] ] ) {
                storage = storages[ i ];
                break;
            }
        }

        reg.done(function() {
            this.log( name, storage, type );
        }, this );

        return this[ storage ].set.apply( this, [ name, data, type, reg.id ] );
    };

    this.get = function( name ) {
        var meta = this.meta( name ),
            id = this.register().id;

        if ( meta ) {
            return this[ meta.storage ].get.apply( this, [ name, meta.type, id ] );
        }

        jar.reject( id );
        return this;
    };

    this.remove = function( name ) {

        // If method called without arguments – destroy store,
        // if it exist
        if ( !arguments.length ) {
            delete this.order;
            return this.clear( true );
        }

        var meta = this.meta( name ),
            reg = this.register(),
            id = reg.id;

        if ( meta && this[ meta.storage ] ) {
            reg.done(function() {
                this.removeRecord( name );
            }, this );

            return this[ meta.storage ].remove.apply( this, [ name, id ] );
        } else {

            // Make request async
            window.setTimeout(function() {
                jar.resolve( id );
            });

            return this;
        }

        // Make request async
        window.setTimeout(function() {
            jar.resolve( id );
        });

        return this;
    };

    this.clear = function( destroy ) {
        var clear, when, def,
            self = this,
            name = this.name,
            data = jar.data[ name ],
            meta = jar.data._meta[ name ],
            defs = [];

        if ( !meta || meta && !meta.length ) {
            def = this.register();

            // Make request async
            window.setTimeout(function() {
                if ( destroy ) {
                    kill( name );
                }

                jar.resolve( def );
            });

            return this;
        }

        for ( var storage in meta.storages ) {
            clear = this.register();
            defs.push( clear );

            this[ storage ].clear.apply( this, [ clear.id, destroy ] );
        }

        if ( destroy ) {

            // Remove all meta-info
            when = jar.when.apply( this, defs ).done(function() {
                kill( name );
            });

        } else {

            // Save storages meta-info
            when = jar.when.apply( this, defs ).done(function() {
                jar.data._meta[ name ] = {
                    storages: {},
                    length: 0
                };
            });
        }

        def = this.register();

        when.done(function() {
            def.resolve();

        }).fail(function() {
            def.reject();
        });

        return this;
    };

    function kill( name ) {
        delete jar.data[ name ];
        delete jar.data._meta[ name ];
    }
}.call( jar.fn );
