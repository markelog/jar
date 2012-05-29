!function() {
    var proto,
        slice = [].slice;

    function Deferred() {
        this.lists = {
            done: [],
            fail: [],
            always: []
        }

        this.state = "pending";

        return this;
    }

    Deferred.prototype = {
        constructor: Deferred,

        add: function( type, fn, context ) {
            var state;
            context = context || jar;

            if ( !fn ) {
                return jar;
            }

            if ( this.state != "pending" ) {
                if ( this.state == "resolved" && type == "done" ) {
                   fn.apply( context, this.args );
                   return jar;
                }

                if ( this.state == "reject" && type == "fail" ) {
                    fn.apply( context, this.args );
                    return jar;
                }

                fn.apply( context, this.args );
            }

            this.lists[ type ].push({
                fn: fn,
                context: context
            });

            return jar;
        },

        iterate: function( type, args ) {
            var value, always;

            for ( var i = 0, l = this.lists[ type ].length; i < l; i++ ) {
                value = this.lists[ type ][ i ];

                value.fn.apply( value.context || jar, args );

                if ( always = this.lists.always[ i ] ) {
                    always.fn.apply( context || jar, args );
                }
            }

            return jar;
        },

        resolve: function( args ) {
            this.state = "resolved";
            return this.iterate( "done", this.args = args );
        },

        reject: function( args ) {
            this.state = "rejected";
            return this.iterate( "fail", this.args = args );
        },

        done: function( fn, context ) {
            return this.add( "done", fn, context );
        },

        always: function( fn, context ) {
            return this.add( "always", fn, context );
        },

        fail: function( fn, context ) {
            return this.add( "fail", fn, context );
        }
    }

    this.Deferred = function() {
        return new Deferred();
    }

    this.resolve = function( id ) {
        var args = slice.call( arguments ),
            def = this.deferreds[ id ];

        args.shift();
        delete this.deferreds[ id ];

        return def.resolve( args );
    }

    this.reject = function( id ) {
        var args = slice.call( arguments ),
            def = this.deferreds[ id ];

        args.shift();

        delete this.deferreds[ id ];
        return def.reject( args );
    }

    this.fn.registr = function() {
        var id = new Date().getTime();

        this.active = jar.deferreds[ id ] = jar.Deferred();

        return id;
    }

    this.deferreds = {};

}.call( jar );