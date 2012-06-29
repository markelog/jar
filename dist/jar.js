/*
* jar
*
*
* Copyright (c) 2012 Oleg
* Licensed under the MIT, GPL licenses.
*/

!function() {
    var jar,
        storeNames = /[^A-Za-z0-9]/g,
        storageInfo = window.storageInfo || window.webkitStorageInfo,
        toString = "".toString,
        order = {
            xml: [ "sql", "lc" ],
            json: [  "sql", "lc" ],
            javascript: [ "sql", "lc" ],
            text: [ "websql", "lc" ]
        };

    // Use idb and fs only if we have storageInfo interface
    if ( storageInfo ) {
        order.xml = [ "fs", "idb" ].concat( order.xml );
        order.json = [ "idb" ].concat( order.json );
        order.javascript = [ "fs" ].concat( order.javascript );
        order.text = [ "idb", "lc" ];
    }

    jar = this.jar = function jar( name, storage ) {
        return new jar.fn.init( name, storage );
    };

    jar.order = order;

    jar.prefixes = {
        storageInfo: storageInfo
    };

    /*
    jar.aliases = {
        storages: {
            idb: [ "indexeddb", "idb", "indb" ],
            sql: [ "websql", "sql" ],
            lc: [ "localStorage", "webstorage", "lc" ],
            fs: [ "filesystem", "fsapi",  ]
        },
        types: {
            js: [ "javascript" ],
            text: [ "text" ]
        }
    };
    */

    jar.prototype = this.jar.fn = {
        constructor: jar,

        storages: [],
        types: [ "xml", "html", "javascript", "text", "json" ],

        init: function( name, storage ) {

            // Name of a object store must contain only alphabetical symbols
            this.name = name ? name.replace( storeNames, "repl" ) : "jar";
            this.deferreds = {};
            this.stores = {};

            if ( !storage ) {
                this.order = order;
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

                // Initiate storage
                defs.push( this[ storage ]( this.name, this ) );

                // Initiate meta-data for this storage
                this.log( storage );
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

    jar.type = function( data ) {
        if ( !data || toString === data.toString ) {
            return "text";
        }

        var documentElement = ( data.ownerDocument || data ).documentElement;

        if ( documentElement && documentElement.nodeName.toLowerCase() !== "html" ) {
            return "xml";
        }

        if ( data.nodeType ) {
            return "html";
        }

        if ( typeof data == "object" ) {
            return "json";
        }

        return "text";
    };

}.call( window );
!function() {
    var lc = localStorage,
        data = lc[ "jar-meta" ];

    jar.data = data ? jar.filters.json( data ) : {};

    function unload() {
         lc[ "jar-meta" ] = jar.rFilters.json( jar.data );
    }

    if ( window.onbeforeunload ) {
        if ( window.attachEvent ) {
            window.attachEvent( "onbeforeunload", unload );
        } else {
            window.addEventListener( "onbeforeunload", unload, false );
        }
    } else {
        window.history.navigationMode = "compatible";
        window.addEventListener( "unload", unload, false );
    }

    // Log meta-data
    this.log = function( name, storage, type ) {
        var data;

        if ( !jar.data[ this.name ] ) {
            jar.data[ this.name ] = {

                // Possible vulnerable
                _storages: {},

                _length: 0
            };
        }

        data = jar.data[ this.name ];

        // Check for name if we have to only initiate storage
        if ( storage ) {
            data[ name ] = {
                storage: storage,
                type: type
            };

            data._length++;
        } else {
            storage = name;
        }

        // Remember total amounts of keys that uses this type of storages
        if ( !data._storages[ storage ] ) {
            data._storages[ storage ] = 0;
        }

        data._storages[ storage ]++;

        return this;
    };

    // Remove meta-data
    this.removeRecord = function( name ) {
        var storage,
            meta = jar.data[ this.name ];

        if ( !data ) {
            return this;
        }

        storage = data._storages;

        delete data[ name ];

        // If data is equal to zero we still no removing data-store
        data._length--;

        // But we remove info about storages
        if ( !--data._storages[ storage ] ) {
            delete data._storages[ storage ];
        }

        return this;
    };

    // Get meta-data
    this.meta = function( name ) {
        var data;

        if ( data = jar.data[ this.name ] ) {
            return data[ name ];
        }
    };
}.call( jar.fn );
!function() {
    var gEval = window.execScript || eval;

    this.filters = {
            json: JSON.parse,

            javascript: function( data ) {
                gEval( data );
                return data;
            },

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

                        xml = new window.ActiveXObject( "Microsoft.XMLDOM" );
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
                var doc = document.implementation.createHTMLDocument("").documentElement;

                return function( data ) {
                    doc.innerHTML = data;

                    return doc.firstElementChild;
                };
            }()
    };

    this.executable = {
        javascript: true
        //css: true - not right now
    };

    this.text = {
        json: JSON.stringify,

        xml: function( node ) {
            if ( typeof node != "string" ) {
                return new window.XMLSerializer().serializeToString( node );
            }

            return node;
        },

        text: function( text ) {
            return text;
        },
    };

    this.text.javascript = this.text.text;
    this.text.html = this.text.xml;

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
        }
    };

    this.Deferred = function() {
        return new Deferred();
    };

    this.when = function() {
        var def = jar.Deferred(),
            executed = 0,
            length = arguments.length;

        def.context = this;

        if ( !length ) {
            return def.resolve();
        }

        function done() {
            if ( def.state == "pending" && length == ++executed ) {
                def.resolve();
            }
        }

        function reject() {
            def.reject();
        }

        for ( var i = 0; i < length; i++ ) {
            arguments[ i ].always( done, this ).fail( reject, this );
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

        // FIXME this.deferreds stored almost forever
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
!function () {
    this.set = function( name, data, type ) {
        type = type || jar.type( data );

        var storage,
            reg = this.register(),
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

        // If method called without arguments – destroy store
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
        }

        // Make request async
        window.setTimeout(function() {
            jar.resolve( id );
        });

        return this;
    };

    this.clear = function( destroy ) {
        var clear, when,
            data = jar.data[ this.name ],
            def = this.register(),
            defs = [];

        if ( !data._length && !destroy ) {

            // Make request async
            window.setTimeout(function() {
                def.resolve();
            });

            return this;
        }

        for ( var storage in data._storages ) {
            clear = this.register();
            defs.push( clear );

            this[ storage ].clear.apply( this, [ clear.id, destroy ] );
        }

        if ( destroy ) {

            // Remove all meta-info
            when = jar.when.apply( this, defs ).done(function() {
                delete jar.data[ this.name ];
            });
        } else {

            // Save storages meta-info
            when = jar.when.apply( this, defs ).done(function() {
                jar.data[ this.name ] = {
                    _storages: {},
                    _length: 0
                };
            });
        }

        when.done(function() {
            def.resolve();
        }).fail(function() {
            def.reject();
        });

        return this;
    };
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
            var xhr = new XMLHttpRequest();
            xhr.open( "get", "filesystem:" + origin + "/temporary/" + base + "/" + name, false );
            xhr.send();

            if ( xhr.readyState === 4 ) {
                jar.resolve( id, xhr.responseXML || xhr.responseText, "xml", "fs" );

            } else {
                jar.reject( id );
            }
        };

    this.storages.push( "fs" );

    this.fs = function( name, instance ) {
        return new proto.init( name, instance );
    };

    fs = jar.fs = {};

    proto = this.fs.prototype = {
        constructor: this.fs,

        init: function( name, instance ) {
            this.name = name;
            this.def = jar.Deferred();

            return this.setup().def.done(function() {
                instance.stores.fs = this.dir;
            }, this );
        },

        setup: function() {
            var self = this,
                name = this.name,
                def = this.def;

            function reject() {
                def.reject();
            }

            requestFileSystem( 0 /* Temporary */, 0, function( entry ) {
                (fs.db = entry.root).getDirectory( name, {
                    create: true
                }, function( dir ) {
                    self.dir = dir;
                    def.resolve();

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

        this.stores.fs.getFile( name, {
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

        this.stores.fs.getFile( name, {}, function( entry ) {
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

        this.stores.fs.getFile( name, {
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

        this.stores.fs.removeRecursively(function( entry ) {

            if ( !destroy ) {

                // If we have to re-create the same dir
                fs.db.getDirectory( self.name, {
                    create: true
                }, function( dir ) {
                    self.stores.fs = dir;

                    jar.resolve( id );
                }, reject );

            } else {
                delete self.stores.fs;

                jar.resolve( id );
            }
        }, reject );

        return this;
    };
}.call( jar.fn );