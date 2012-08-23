!function() {
    var proto, sql;

    if ( !window.openDatabase ) {
        return;
    }

    this.support.sql = true;

    this.sql = function( name, instance ) {
        return new proto.init( name, instance );
    };

    proto = this.sql.prototype = {
        constructor: this.sql,

        init: function( name, instance ) {
            this.name = name;
            this.def = jar.Deferred();

            return this.setup().def.done(function() {
                instance.stores.sql = this.db;
            }, this );
        },

        setup: function() {
            var def = this.def,
                command = "CREATE TABLE IF NOT EXISTS " + this.name + "(name TEXT PRIMARY KEY ASC, data TEXT)";

            function resolve() {
                def.resolve();
            }

            function reject() {
                def.reject();
            }

            this.db = window.openDatabase( "jar", "1", "jar Database", 0 );
            this.db.transaction(function( trans ) {

                // have to use variable for command, can't use an expression
                trans.executeSql( command, [], resolve, reject );
            });

            return this;
        }
    };

    proto.init.prototype = proto;

    this.sql.set = function( name, data, type, id ) {
        var update = "UPDATE " + this.name + " SET data = ? WHERE name = ?",
            insert = "INSERT INTO " + this.name + "(data, name) VALUES(?, ?)",
            store = this.stores.sql;

        // We can store only text
        data = jar.text[ type ]( data );

        function resolve() {
            jar.resolve( id, type, "sql" );
        }

        function reject() {
            jar.reject( id );
        }

        try {
            store.transaction(function( trans ) {

                // Try to add data, if transaction will fall then try to update it
                trans.executeSql( insert, [ data, name ], resolve, function() {

                    // Can't re-use transaction in Opera
                    store.transaction(function( trans ) {
                        trans.executeSql( update, [ data, name ], resolve, reject );
                    });
                });
            });
        } catch ( _ ) {
            reject();
        }

        return this;
    };

    this.sql.get = function( name, type, id ) {
        var command = "SELECT data FROM " + this.name + " WHERE name = '" + name + "'";
        var self = this;

        function resolve( trans, result ) {
            result = result.rows;

            // when data isn't there its still succesfull operation, but not for us
            if ( result.length != 1 ) {
                return jar.reject( id );
            }

            jar.resolve( id, jar.filters[ type ]( result.item( 0 ).data ), type, "sql" );
        }

        function reject() {
            jar.reject( id );
        }

        try {
            this.stores.sql.transaction(function( trans ) {
                trans.executeSql( command, [], resolve, reject );
            });
        } catch ( _ ) {
            jar.reject( id );
        }

        return this;
    };

    this.sql.remove = function( name, id ) {
        var command = "DELETE FROM " + this.name + "WHERE name = ?";

        function resolve() {
            jar.resolve( id );
        }

        function reject() {
            jar.reject( id );
        }

        try {
            this.stores.sql.transaction(function( trans ) {
                trans.executeSql( command, [ name ], resolve, reject );
            });
        } catch ( _ ) {
            reject();
        }

        return this;
    };

    this.sql.clear = function( id, destroy ) {
        var self = this,
            command = destroy ? "DROP TABLE " + this.name : "DELETE FROM " + this.name;

        function resolve() {
            jar.resolve( id );
        }

        function reject( trans, error ) {

            // code == 5 – no such table
            if ( error.code == 5 ) {
                return resolve();
            }
            jar.reject( id );
        }

        try {
            this.stores.sql.transaction(function( trans ) {
                trans.executeSql( command, [], resolve, reject );
            });
        } catch ( _ ) {
            reject();
        }

        return this;
    };
}.call( jar.fn );