!function() {
    if ( jar.prefixes.idb ) {
        var request,
            that = this,
            name = this.name,
            ready = jar.Deferred(),
            version = 1,
            base = {};

        ready.done(function() {
             this.idb = {
                storage: base.storage,

                ready: ready,

                set: function( data ) {
                    var deferred = jar.Deferred(),
                        store = this.db.transaction([ name ], this.prefixes.IDBTransaction.READ_WRITE ).objectStore( name ),
                        transaction = store.put( data );

                    transaction.onsuccess = function() {
                        deferred.resolve();
                    };

                    transaction.onerror = function() {
                        deferred.reject();
                    };
                }
            };
        }, this );

        // Открываем соеденение с базой
        request = jar.prefixes.idb.open( name, version );

        // onupgradeneeded это новый эвент он есть только в Фаервоксе.
        // Хром использует устаревший (через setVersion) способ инициализации базы
        if ( request.onupgradeneeded === null ) {
            request.onupgradeneeded = function () {
                base.storage = this.result;
                setup();
            };

            request.onsuccess = function() {
                base.storage = this.result;
                ready.resolve();
            };

        } else {
            request.onsuccess = function() {
                (base.storage = this.result ).setVersion( version ).onsuccess = setup;
            };
        }
    }

    function setup() {
        base.storage.createObjectStore( name, {
            keyPath: "id"
        });

        ready.resolve();
    }
}.call( jar.fn );