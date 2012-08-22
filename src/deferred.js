!function() {
    var proto, array, promise, name,
        counter = 0,
        methods = [ "done", "fail", "always", "then", "state", "context" ],
        slice = [].slice;


   function add( data ) {
        var state = data.state,
            context = data.context || jar,
            type = data.type,
            context = data.context,
            args = data.args,
            fn = data.fn,
            dfd = data.dfd;

        if ( !fn ) {
            return dfd;
        }

        if ( state != "pending" ) {
            if ( state == "resolved" && type == "done" ) {
               fn.apply( context, args );
               return dfd;
            }

            if ( state == "rejected" && type == "fail" ) {
                fn.apply( context, args );
                return dfd;
            }

            if ( type == "always" ) {
                fn.apply( context, args );
            }
        }

        data.meta[ type ].push({
            fn: fn,
            context: context
        });

        return dfd;
    };

    function iterate( type, args, dfd, meta, i /* internal */ ) {
        var value, always,
            isAlways = type == "always";

        i = i || 0;
        args = args || [];
        type = meta[ type ];

        for ( var l = type.length; i < l; i++ ) {
            value = type[ i ];

            value.fn.apply( value.context || dfd, args );

            // call "always" callback
            if ( !isAlways && ( always = meta.always[ i ] ) ) {
                always.fn.apply( value.context || dfd, args );
            }
        }

        // If successful or failed callbacks is less then "always" callbacks
        // some of the always callbacks will not be called
        if ( i < meta.always.length ) {
            iterate( "always", args, dfd, meta, i );
        }

        return dfd;
    };

    function Deferred() {
        var data,
            state = "pending",
            meta = {
                done: [],
                fail: [],
                always: []
            };

        this.resolve = function( args ) {
            if ( state == "pending" ) {
                state = "resolved";
                data = args;
                iterate( "done", args, this, meta );
            }

            return this;
        };

        this.reject = function( args ) {
            if ( state == "pending" ) {
                state = "rejected";
                data = args;
                iterate( "fail", args, this, meta );
            }

            return this;
        };

        this.done = function( fn, context ) {
            return add({
                type: "done",
                fn: fn,
                context: context || this.context,
                dfd: this,
                meta: meta,
                state: state,
                args: data
            });
        };

        this.always = function( fn, context ) {
            return add({
                type: "always",
                fn: fn,
                context: context || this.context,
                dfd: this,
                meta: meta,
                state: state,
                args: data
            });
        };

        this.fail = function( fn, context ) {
            return add({
                type: "fail",
                fn: fn,
                context: context || this.context,
                dfd: this,
                meta: meta,
                state: state,
                args: data
            });
        };

        this.then = function( success, error, context ) {
            if ( typeof error == "function" ) {
                this.done( success, context ).fail( error, context );

            } else {
                this.done( success, error || context );
            }

            return this;
        };

        this.state = function() {
            return state;
        };
    }

    function Promise( deferred ) {
        for ( var i = 0, l = methods.length; i < l; i++ ) {
            this[ methods[ i ] ] = deferred[ methods[ i ] ];
        }
    }

    this.Deferred = function() {
        return new Deferred();
    };

    this.Promise = function( deferred ) {
        return new Promise( deferred || new Deferred() );
    };

    this.when = function() {
        var def = jar.Deferred(),
            defs = arguments,
            executed = 0,
            args = [],
            length = defs.length;

        def.context = this;

        if ( !length ) {
            return def.resolve();
        }

        function done( index, doneArgs ) {
            doneArgs = slice.call( doneArgs );
            args[ index ] = doneArgs.length == 1 ? doneArgs[ 0 ] : doneArgs;

            if ( def.state() == "pending" && length == ++executed ) {
                def.resolve( args );
            }
        }

        function reject() {
            def.reject( slice.call( arguments ) );
        }

        function loop( i ) {
            return function() {
                done( i, arguments );
            };
        }

        for ( var i = 0; i < length; i++ ) {
            ( defs[ i ] || defs[ i ].active ).always( loop( i ), this ).fail( reject, this );
        }

        return def;
    };

    this.resolve = function( def ) {
        var id = typeof def == "object" ? def.id : def,
            args = slice.call( arguments );

        def = this.deferreds[ id ];

        args.shift();

        return def.resolve( args );
    };

    this.reject = function( def ) {
        var id = typeof def == "object" ? def.id : def,
            args = slice.call( arguments );

        def = this.deferreds[ id ];

        args.shift();

        return def.reject( args );
    };

    this.fn.register = function() {
        var id = new Date().getTime() + (++counter);

        this.active = this.deferreds[ id ] = jar.deferreds[ id ] = jar.Deferred();
        this.active.id = id;

        // Remove resolved deferreds
        this.active.always(function() {
            //delete this.deferreds[ id ];
            delete jar.deferreds[ id ];

        }, this );

        return this.active;
    };

    this.fn.done = function( fn, context ) {
        this.active.done( fn, context || this );
        return this;
    };

    this.fn.fail = function( fn, context ) {
        this.active.fail( fn, context || this );
        return this;
    };

    this.fn.always = function( fn, context ) {
        this.active.always( fn, context || this );
        return this;
    };

    this.fn.then = function() {
        this.active.then.apply( this.active, arguments );
        return this;
    };

    this.deferreds = {};

    this.fn.promise = function() {
        var def,
            defs = [];

        for ( var id in this.deferreds ) {
            def = this.deferreds[ id ];

            if ( def.state() == "pending" ) {
                defs.push( def );
            }
        }

        t = jar.when.apply( this, defs );

        return new Promise( t );
    };
}.call( jar );