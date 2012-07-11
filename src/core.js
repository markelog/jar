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
            text: sqlLc
        };

    // Firefox ask user permission to use indexedDb, because of this we don't use it in FF
    if ( storageInfo ) {
        order.xml = [ "fs", "idb" ].concat( order.xml );
        order.json = [ "idb" ].concat( order.json );
        order.javascript = [ "fs" ].concat( order.javascript );
        order.text = [ "idb", "lc" ];

    } else if ( window.msIndexedDB ) {
        order.xml = [ "idb" ].concat( order.xml );
        order.json = [ "idb" ].concat( order.json );
        order.javascript = [ "idb" ].concat( order.javascript );
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
        types: [ "xml", "html", "javascript", "js", "text", "json" ],

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
}.call( window );