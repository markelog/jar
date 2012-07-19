<h1>Jar</h1>
<p>
Jar is another wrapper for localStorage. But it also let you use Filesystem API, IndexedDB and SQLite.
Some people have strong opinions about storages in browsers should be async-based, this api encapsulates all
async-based api's under the hood, fallbacking on localStorage only if it really have to.

Jar let you store diffrent kind of data – css, js, xml, html... etc. It will choose for you what storage type
will fit more appropriate for diffrent data type. Or let you download and cache some files, like
js, css or html for example.
</p>

<h2>Getting Started</h2>
<p>Jar architecture based on Promise/A proposal, for example:</p>

<pre>
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
</pre>

<p>then after you created store you can write stuff in it:</p>
<pre>
    // If argument is passed, it will became the name of your store
    jar( "jar is cool" ).done(function() {
        var store = this;

        this.set( "name of some awesome content", "awesome content" ).done(function() {
            console.log( "content is written" );
        });
    });
</pre>

<p>or you can store some more complex data:</p>
<pre>
    var node = document.getElementById( "sometag" );
    store.set( "html tag", node ).done(function( type ) {
        console.log( type ) // html
    });
</pre>

<p>and you can get it the same way you put it:</p>
<pre>
store.get( "html tag" ).done(function( html ) {
    console.log( html.nodeType ) // 1
});
</pre>

<p>you can do the same with all kind of data, json, css, js: </p>
<pre>
store.set( "my json", { "json": "json" } ).done(function( data ) {
    console.log( data.json ) // json

}).get( "my json" ).done(function( json ) {
    console.log( typeof json ); // object

}).set( "my js", "alert( alarm!)", "js" ).done(function() {
    this.get( "my js" ) // alarm!

}).set( "my css", "body { color: red }", "css" ).done(function() {
    this.get( "my css" ) // now color stuff inside the body is red

// If you want to know when every action is complited you can do this:
}).promise().done(function() {
    // now everything is done
})
</pre>

<p>or you can clean or remove data</p>
<pre>
    store.remove( "my json" ).done(function() {
        // json no more
    });

    // or just clear entire store
    store.clear().done(function() {
        // now nothing exist
    });

    store.remove().done(function() {
        // if you call jar#remove without arguments it will destroy "jar is cool" store
    });

    // speaking of destroying things
    jar.destroy().done(function() {
        // now every store is not exist anymore
    });
</pre>

<p>if you want to cache your css, js files its cool too:</p>
<pre>
    jar.load( "alert.js" ).done(function() {
        alert.js // downloaded and executed, next time it will be downloaded and executed from Filesystem API, or IndexedDD or Sql.. well, you never know
    });
</pre>

<p>if you want to know when two deferred is done or failed you can use jar.when:</p>
<pre>
    var turtle = jar( "big turtle" ),

        // I want to use bear store only with localStorage
        bear = jar( "sexy bear", "lc" /* idb fs sql */ );

    jar.when( turtle, bear ).done(function( turtle, bear ) {
        turtle.set( "set stuff", "bla-blah" );
        bear.remove();
    });
</pre>

<p>you can specify what storage type you want to use:</p>
<pre>
    // if we don't have Filesystem API (fs) use indexedDB storage (idb)
    // and even if idb is not implemented – fallback to localStorage (lc)
    jar( "something gotta work", "fs idb lc" );
</pre>



