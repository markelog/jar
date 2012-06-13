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

        init: function( name, type ) {
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

        if ( typeof data == "object" ) {
            return "json";
        }

        return "text";
    }

}.call( window );
