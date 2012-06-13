!function() {
    this.prefixes = {
        requestFileSystem: window.requestFileSystem || window.webkitRequestFileSystem,

        storageInfo: window.storageInfo || window.webkitStorageInfo,

        Blob: window.BlobBuilder || window.WebKitBlobBuilder || window.Blob,

        // IndexedDB prefixes
        indexedDB: window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB,
        IDBTransaction: window.IDBTransaction || window.webkitIDBTransaction,
        IDBKeyRange: window.IDBKeyRange || window.webkitIDBKeyRange,
        IDBTransaction: window.IDBTransaction || window.webkitIDBTransaction
    }

    this.prefixes.idb = this.prefixes.indexedDB;
    this.prefixes.lc = localStorage;

}.call( jar );