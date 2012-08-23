<h1>jar.js</h1>
<p>
Jar is another wrapper for localStorage, but it also let you use FileSystem API, IndexedDB and SQLite (Web SQL).

Some people have <a href="https://hacks.mozilla.org/2012/03/there-is-no-simple-solution-for-local-storage/">strong</a>
<a href="http://www.nczonline.net/blog/2012/04/25/the-performance-of-localstorage-revisited/">opinions</a> about storages in browsers should be async-based, this API encapsulates all
async-based API's under the hood, fallbacking on localStorage only if it really have to.
</p>

<p>
Jar let you store different kind of data – css, js, xml, html... etc. It will choose for you, what storage
will fit more appropriate for different data-type (or you can specify what storages you want to use).
Or let you download, cache and execute some files, like js and css.
</p>

<h2>Browsers</h2>
Firefox, Chrome, IE8+, Opera

<h2>About</h2>
<p>Jar architecture based on Promise/A proposal, for example:</p>

```javascript
jar()
    .done(function() {
        console.log( "store is created" );
    })
    .fail(function() {
        console.log( "store is failed to be created" );
    })
    .always(function() {
        console.log( "created or not, something happend!" )
    })
    .then(function() {
        console.log( "store is created" );

    }, function() {
        console.log( "store is failed to be created" );
    });
```

<p>then, after you created the store you can write stuff in it:</p>

```javascript
// If argument is passed, it will became the name of your store
jar( "awesome store" ).done(function() {
    var store = this;

    this.set( "name of some awesome content", "awesome content" ).done(function() {
        console.log( "awesome" );
    });
});
```

<p>or you can store some more complex data:</p>
```javascript
var node = document.getElementsByTagName( "div" )[ 0 ];
store.set( "div", node ).done(function( type ) {
    console.log( type ); // html
});
```

<p>you can get it the same way you put it:</p>
```javascript
store.get( "div" ).done(function( div ) {
    console.log( div.nodeName ); // DIV
});
```

<p>you can do the same with all kind of data, json, css, js: </p>
```javascript
store.set( "my json", { "json": "json" } ).done(function( type ) {
    console.log( type ); // json

    this.get( "my json" ).done(function( json ) {
        console.log( data.json ); // json
    })

}).set( "my js", 'alert( "alarm!" )', "js" ).done(function() {
    this.get( "my js" ); // alarm!

}).set( "my css", "body { color: red }", "css" ).done(function() {
    this.get( "my css" ); // now color stuff inside the body is red

// If you want to know when every action is complited, you can do this:
}).promise().done(function() {
    // now everything is done
})
```

<p>or you can clean or remove data</p>
```javascript
store.remove( "my json" ).done(function() {
    // json no more
});

// or just clear entire store
store.clear().done(function() {
    // now nothing exist
});

store.remove().done(function() {
    // if you call jar#remove without arguments it will destroy "awesome" store
});

// speaking of destroying things
jar.destroy().done(function() {
    // now every store is not exist anymore
});
```

<p>if you want to cache your css, js files its cool too:</p>
```javascript
jar.load( "alert.js" ).done(function() {
    // downloaded and executed, next time jar will take and execute this data from
    // FileSystem API, or IndexedDD or SQ.. well, you never know
});
```

<p>if you want to know when two deferreds is done or failed you can use jar.when:</p>
```javascript
var turtle = jar( "shy turtle" ),

    // I want to use bear store only with localStorage
    bear = jar( "sexy bear", "lc" /* idb fs sql */ );

jar.when( turtle, bear ).done(function( turtle, bear ) {
    turtle.set( "set stuff", "bla-blah" );
    bear.remove();
});
```

<p>you can specify what storage type you want to use:</p>
```javascript
// if we don't have FileSystem API (fs) use indexedDB storage (idb)
// and even if idb is not implemented – fallback to localStorage (lc)
jar( "something gotta work", "fs idb lc" );
```

<h2>Similar libraries</h2>
<a href="https://github.com/WebReflection/db">db</a>
<a href="http://brian.io/lawnchair/">lawnchair</a>