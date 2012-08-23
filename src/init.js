!function() {

    var indexOf = [].indexOf,

        // Yeah, stupid, ugly browser detection, but Firefox ask user permission to use IndexedDB
        // we can't possibly detect that
        isMoz = !!~window.navigator.userAgent.indexOf( "Firefox" ),
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
            support = jar.fn.support;

        jar.fn.storages = [];

        if ( typeof preferences == "boolean" ) {
            moz = preferences;
            preferences = undefined;
        }

        preferences = preferences || preferable;

        for ( var type in preferences ) {
            preference = preferences[ type ];

            for ( var i = 0, l = preference.length; i < l; i++ ) {
                value = preference[ i ];

                if ( value in support ) {

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

        for ( value in support ) {
            if ( value == "idb" && isMoz && !moz ) {
                continue;
            }

            if ( !jar.isUsed( value ) ) {
                jar.fn.storages.push( value );
            }
        }

        order.javascript = order.js;
        jar.order = order;
    };

    // We have two types of storages – when browser not implement the storage and indexedDB in Firefox
    jar.isUsed = function( storage ) {
        if ( indexOf ) {
            return !!~indexOf.call( jar.fn.storages, storage );
        }

        for ( var i = 0, l = jar.fn.storages; i < l; i++ ) {
            if ( i in jar.fn.storages && jar.fn.storages[ i ] === storage ) {
                return true;
            }
        }

        return false;
    };

    jar.preference();

}.call( jar );