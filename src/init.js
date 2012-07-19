!function() {
    var preferable = {
        js: [ "fs", "idb", "sql", "lc" ],
        css: [ "fs", "idb", "sql", "lc" ],
        xml: [ "fs", "idb", "sql", "lc" ],
        html: [ "idb", "sql", "lc" ],
        text: [ "sql", "idb", "lc" ],
        json: [ "idb", "sql", "lc" ]
    };

    jar.preference = function( preferences ) {
        var moz, value, preference,
            order = {},
            storages = jar.fn.storages.toString();

        if ( preferences ) {
            moz = true;

        } else {
            preferences = preferable;
        }

        for ( var type in preferences ) {
            preference = preferences[ type ];

            for ( var i = 0, l = preference.length; i < l; i++ ) {
                value = preference[ i ];

                // We don't use indexOf for Array, because of lack support for it in IE8
                if ( ~storages.indexOf( value ) ) {

                    // Firefox ask user permission to use indexedDb, because of this, we don't use it in FF
                    // if argument is default argument
                    if ( value == "idb" && !moz && window.mozIndexedDB ) {
                        continue;
                    }

                    order[ type ] = [ value ];
                    break;
                }
            }
        }

        order.javascript = order.js;
        jar.order = order;
    };

    jar.preference();

}.call( jar );