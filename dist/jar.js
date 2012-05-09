/*
* jar
*
*
* Copyright (c) 2012 Oleg
* Licensed under the MIT, GPL licenses.
*/

!function() {
    var aliases = {
        idb: [ "indexeddb", "idb", "indb" ],
        sql: [ "websql", "sql" ],
        lc: [ "localStorage", "webstorage", "lc" ],
        fsapi: [ "filesystem", "fsapi" ]
    },
    toString = "".toString;

    this.jar = function jar( storage, name, type ) {
        return new jar.fn.init( storage, name, type );
    }

    jar.prototype = this.jar.fn = {
        constructor: jar,

        init: function( storage, name, type ) {
            var types;
            type = type || "text";

            this.name = name || "jar";
            this.types = {
                xml: [ "sql", "lc" ],
                json: [  "sql", "lc" ],
                javascript: [ "sql", "lc" ],
                text: [ "lc" ]
            }

            if ( jar.prefixes.storageInfo ) {
                this.types.xml = [ "idb", "fs" ].concat( this.types.xml );
                this.types.json = [ "idb" ].concat( this.types.json );
                this.types.javascript = [ "fs" ].concat( this.types.javascript );
            }

            types = this.types[ type ];

            if ( jar[ storage ] ) {
                this.storage = jar[ storage ];
            }

            for ( var i = 0, l = this.types.length; i < l; i++ ) {
                if ( jar.prefixes[ types[ i ] ] ) {
                    this.storage = jar[ storage ];
                    break;
                }
            }

            return this;
        }
    }

    jar.fn.init.prototype = jar.fn;

    jar.type = function( data ) {
        if ( !data || toString === data.toString ) {
            return "text";
        }

        var documentElement = ( data.ownerDocument || data ).documentElement;

        if ( documentElement && documentElement.nodeName !== "HTML" ) {
            return "xml";
        } else if ( data.nodeType ) {
            return "html";
        }

        if ( typeof data == "Object" ) {
            return "json";
        }

        return "text";
    }

    jar.log = function( name, storage, type ) {
        jar.lc[ "jar-type-" + name ] = storage + ":" + type;
    }

}.call( window );

!function() {
    jar.log = function( name, storage, type ) {
        this.lc[ "jar-type-" + name ] = storage + ":" + type;
    }

    jar.meta = function( name ) {
        var meta = this.lc[ "jar-type-" + name ].split( ":" );

        return {
            storage: meta[ 0 ],
            type: meta[ 1 ]
        }
    }

}.call( jar );
!function() {
    this.filters = {
            json: JSON.parse,

            javascript: window.execScript || eval,

            // from jQuery
            xml: function( data ) {
                if ( typeof data !== "string" || !data ) {
                    return null;
                }

                var xml;

                try {
                    if ( window.DOMParser ) {
                        xml = new window.DOMParser().parseFromString( data , "text/xml" );

                    } else { // IE

                        xml = new ActiveXObject( "Microsoft.XMLDOM" );
                        xml.async = "false";
                        xml.loadXML( data );
                    }
                } catch( e ) {}

                if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
                    throw "Invalid XML: " + data;
                }

                return xml;
            },

            text: function( data ) {
                return data;
            },

            html: function() {
                var div;
                document.createDocumentFragment().appendChild( div = document.createElement( "div" ) );

                return function( data ) {
                    return div.innerHTML = data;
                }
            }()
    }
}.call( jar );
!function() {
    this.prefixes = {
        requestFileSystem: window.requestFileSystem || window.webkitRequestFileSystem,

        storageInfo: window.storageInfo || window.webkitStorageInfo,

        Blob: window.BlobBuilder || window.WebKitBlobBuilder || window.Blob,

        // IndexDB prefixes
        indexedDB: window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB,
        IDBTransaction: window.IDBTransaction || window.webkitIDBTransaction,
        IDBKeyRange: window.IDBKeyRange || window.webkitIDBKeyRange,
        IDBTransaction: window.IDBTransaction || window.webkitIDBTransaction
    }

    this.prefixes.idb = this.prefixes.indexedDB;
    this.prefixes.lc = localStorage;

}.call( jar );
!function() {
    var proto;
    function Deferred() {
        this.lists = {
            done: [],
            fail: [],
            always: []
        }

        this.state = "pending";

        return this;
    }

    Deferred.prototype = {
        constructor: Deferred,

        add: function( type, fn, context ) {
            var state;
            context = context || jar;

            if ( !fn ) {
                return jar;
            }

            if ( this.state != "pending" ) {
                if ( this.state == "resolved" && type == "done" ) {
                   fn.apply( context, this.args );
                   return jar;
                }

                if ( this.state == "reject" && type == "fail" ) {
                    fn.apply( context, this.args );
                    return jar;
                }

                fn.apply( context, this.args );
            }

            this.lists[ type ].push({
                fn: fn,
                context: context
            });

            return jar;
        },

        iterate: function( type, args ) {
            var value, always;

            for ( var i = 0, l = this.lists[ type ].length; i < l; i++ ) {
                value = this.lists[ type ][ i ];

                value.fn.apply( value.context || jar, args );

                if ( always = this.lists.always[ i ] ) {
                    always.fn.apply( context || jar, args );
                }
            }

            return jar;
        },

        resolve: function( args ) {
            this.state = "resolved";
            return this.iterate( "done", this.args = args );
        },

        reject: function( args ) {
            this.state = "rejected";
            return this.iterate( "fail", this.args = args );
        },

        done: function( fn, context ) {
            return this.add( "done", fn, context );
        },

        always: function( fn, context ) {
            return this.add( "always", fn, context );
        },

        fail: function( fn, context ) {
            return this.add( "fail", fn, context );
        }
    }

    this.Deferred = function() {
        return new Deferred();
    }

}.call( jar );
!function () {
    this.get = function() {
        for ( storage in this.prefixes ) {

        }

        return this.storage.get.apply( this, arguments );
    };

    this.set = function( name, data ) {
        var storage,
            storages = this.types[ jar.type( data ) ];

        this.active = jar.Deferred();

        for ( var i = 0, l = storages.length; i < l; i++ ) {
            if ( jar[ storages[ i ] ] ) {
                break;
            }
        }

        return jar[ storages[ i ] ].set.apply( this, arguments );
    };

    this.done = function( fn, context ) {
        this.active.add( "done", fn, context );
    }

    this.fail = function( fn, context ) {
        this.active.add( "fail", fn, context );
    }

    this.always = function( fn, context ) {
        this.active.add( "always", fn, context );
    }

}.call( jar.fn );
!function() {
    if ( jar.prefixes.idb ) {
        var request,
            that = this,
            name = this.name,
            ready = jar.Deferred(),
            version = 1,
            base = {};

        ready.done(function() {
             this.idb = {
                storage: base.storage,

                ready: ready,

                set: function( data ) {
                    var deferred = jar.Deferred(),
                        store = this.db.transaction([ name ], IDBTransaction.READ_WRITE ).objectStore( name ),
                        transaction = store.put( data );

                    transaction.onsuccess = function() {
                        deferred.resolve();
                    };

                    transaction.onerror = function() {
                        deferred.reject();
                    };
                }
            }
        }, this );

        function setup() {
            base.storage.createObjectStore( name, {
                keyPath: "id"
            });

            ready.resolve();
        }

        // Открываем соеденение с базой
        request = jar.prefixes.idb.open( name, version );

        // onupgradeneeded это новый эвент он есть только в Фаервоксе.
        // Хром использует устаревший (через setVersion) способ инициализации базы
        if ( request.onupgradeneeded === null ) {
            request.onupgradeneeded = function () {
                base.storage = this.result;
                setup();
            }

            request.onsuccess = function() {
                base.storage = this.result;
                ready.resolve();
            }

        } else {
            request.onsuccess = function() {
                (base.storage = this.result ).setVersion( version ).onsuccess = setup;
            }
        }
    }
}.call( jar.fn );