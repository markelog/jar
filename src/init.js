!function() {

    // Yeah, stupid, ugly browser detection, but Firefox ask user permission to use IndexedDB
    // we can't possibly detect that
    var isMoz = !!~window.navigator.userAgent.indexOf( "Firefox" ),
        vendor = window.navigator.vendor,
        preferable = {
            js: [ "fs", "idb", "sql", "lc" ],
            css: [ "fs", "idb", "sql", "lc" ],
            xml: [ "fs", "idb", "sql", "lc" ],
            html: [ "idb", "sql", "lc" ],
            text: [ "sql", "idb", "lc" ],
            json: [ "idb", "sql", "lc" ]
        };

    // Yeah, stupid, ugly browser detection, but localStorage in Safari extremely (very, very) fast
    // we can't possibly detect that (actually we can, but its crazy way)
    if ( vendor && ~vendor.indexOf( "Apple" ) ) {
        preferable.js = preferable.css = preferable.xml = preferable.html = preferable.text = preferable.json = [ "lc" ];
    }

    jar.preference = function( preferences, moz ) {
        var value, preference,
            order = {},
            storages = jar.fn.storages.toString();

        preferences = preferences || preferable;

        for ( var type in preferences ) {
            preference = preferences[ type ];

            for ( var i = 0, l = preference.length; i < l; i++ ) {
                value = preference[ i ];

                // We don't use indexOf for Array, because of lack support for it in IE8
                if ( ~storages.indexOf( value ) ) {

                    // Firefox ask user permission to use indexedDb, because of this, we don't use it in FF
                    // if argument is default argument
                    if ( value == "idb" && !moz && isMoz ) {
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