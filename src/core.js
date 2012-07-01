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
        sqlLc = [ "sql", "lc" ],
        order = {
            xml: sqlLc,
            html: sqlLc,
            json: sqlLc,
            javascript: sqlLc,
            text: sqlLc
        };

    // Use idb and fs only if we have storageInfo interface
    if ( storageInfo ) {
        order.xml = [ "fs", "idb" ].concat( order.xml );
        order.json = [ "idb" ].concat( order.json );
        order.javascript = [ "fs" ].concat( order.javascript );
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
        types: [ "xml", "html", "javascript", "js", "text", "json" ],

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