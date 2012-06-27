this.moduleTeardown = function() {
    var idb = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB,
        request = idb.deleteDatabase( "jar" );
    stop();


    request.onsuccess = start();
    request.onerror = function() {
        ok( false, "Can't remove idb database" );
    };

//    localStorage.clear();
}


