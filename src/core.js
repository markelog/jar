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

        storages: [ "fs", "idb", "websql", "lc" ],

        types: [ "xml", "javascript", "text", "json" ],

        init: function( name, storage ) {
            this.name = name || "jar";

            // TODO – add support for aliases
            this.setup( storage || this.storages );

            return this;
        },

        // Setup for all storages
        setup: function( storages ) {
            this.storages = storages = storages.split( " " );
            this.stores = {};

            var storage,
                def = this.register(),
                defs = [];

            for ( var i = 0, l = storages.length; i < l; i++ ) {
                storage = storages[ i ];

                // base for some storages does not need to be created
                if ( typeof this[ storage ] == "function" ) {
                    defs.push( this[ storage ]( this.name, this ) );
                }

                // Initiate meta-data for this storage
                this.log( storage );
            }

            for ( i = 0, l = this.types.length; i < l; i++ ) {
                this.order[ this.types[ i ] ] = storages;
            }

            // Make async only if we have async interfaces
            if ( defs.length ) {
                jar.when.apply( jar, defs )
                    .done(function() {
                        def.resolve();
                    })
                    .fail(function() {
                        def.reject();
                    });
            } else {
                def.resolve();
            }

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