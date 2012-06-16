/*
* jar
*
*
* Copyright (c) 2012 Oleg
* Licensed under the MIT, GPL licenses.
*/

!function() {
    var jar,
        storageInfo = window.storageInfo || window.webkitStorageInfo,
        toString = "".toString,
        order = {
            xml: [ "sql", "lc" ],
            json: [  "sql", "lc" ],
            javascript: [ "sql", "lc" ],
            text: [ "websql", "lc" ]
        };

    if ( storageInfo ) {
        order.xml = [ "idb", "fs" ].concat( order.xml );
        order.json = [ "idb" ].concat( order.json );
        order.javascript = [ "fs" ].concat( order.javascript );
        order.text = [ "idb", "lc" ];
    }

    jar = this.jar = function jar( name, storage ) {
        return new jar.fn.init( name, storage );
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

        order: order,

        storages: "fs idb websql lc",

        types: "xml javascript text json",

        init: function( name, storage ) {
            var storages, types;

            this.name = name || "jar";

            if ( storage ) {
                types = this.types.split( " " );

                for ( var i = 0, l = types.length; i < l; i++ ) {
                    this.order[ types[ i ] ] = [ storage ];
                }
            }

            // TODO – add support for aliases
            this.setup( name, storage || this.storages );

            return this;
        },

        // Setup for all storages
        setup: function( name, storages ) {
            storages = storages.split( " " );
            var storage,
                defs = [];

            this.instances = {};
            this.active = jar.Deferred();

            for ( var i = 0, l = storages.length; i < storages.length; i++ ) {
                storage = storages[ i ];

                this.instances[ storage ] = {};

                if ( typeof this[ storage ] == "function" ) {
                    defs.push( this[ storage ]( name ) );
                }
            }

            jar.when.apply( jar, defs ).done( function() {
                this.active.resolve();
            }, this );

            return this;
        }
    };

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

        if ( typeof data == "object" ) {
            return "json";
        }

        return "text";
    };

}.call( window );