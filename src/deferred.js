!function() {
    var proto, array, promise, name,
        counter = 0,
        methods = [ "done", "fail", "always", "then", "_add" ],
        slice = [].slice;

    function Deferred() {
        this.lists = {
            done: [],
            fail: [],
            always: []
        };

        // Total amount of called callbacks
        this.length = 0;

        // By exposing this prop we "diverge" with promise "spec"
        this.state = "pending";
    }

    Deferred.prototype = {
        constructor: Deferred,

        _add: function( type, fn, context ) {
            var state;
            context = context || jar;

            if ( !fn ) {
                return this;
            }

            if ( !this.args ) {
                this.args = [];
            }

            if ( this.state != "pending" ) {
                if ( this.state == "resolved" && type == "done" ) {
                   fn.apply( context, this.args );
                   return this;
                }

                if ( this.state == "rejected" && type == "fail" ) {
                    fn.apply( context, this.args );
                    return this;
                }

                if ( type == "always" ) {
                    fn.apply( context, this.args );
                }
            }

            this.lists[ type ].push({
                fn: fn,
                context: context
            });

            return this;
        },

        _iterate: function( type, args, i /* internal */ ) {
            var value, always,
                isAlways = type == "always";

            i = i || 0;
            args = args || [];
            type = this.lists[ type ];

            for ( var l = type.length; i < l; i++ ) {
                value = type[ i ];

                value.fn.apply( value.context || this, args );

                // call "always" callback
                if ( !isAlways && ( always = this.lists.always[ i ] ) ) {
                    always.fn.apply( value.context || this, args );
                }
            }

            // If successful or failed callbacks is less then "always" callbacks
            // some of the always callbacks will not be called
            if ( i < this.lists.always.length ) {
                this._iterate( "always", args, i );
            }

            return this;
        },

        resolve: function( args ) {
            if ( this.state == "pending" ) {
                this.state = "resolved";
                this._iterate( "done", this.args = args );
            }

            return this;
        },

        reject: function( args ) {
            if ( this.state == "pending" ) {
                this.state = "rejected";
                this._iterate( "fail", this.args = args );
            }

            return this;
        },

        done: function( fn, context ) {
            return this._add( "done", fn, context || this.context );
        },

        always: function( fn, context ) {
            return this._add( "always", fn, context || this.context );
        },

        fail: function( fn, context ) {
            return this._add( "fail", fn, context || this.context );
        },

        then: function( success, error, context ) {
            if ( typeof error == "function" ) {
                this._add( "done", success, context || this.context )
                    ._add( "fail", error, context || this.context );

            } else {
                this._add( "done", success, error || this.context );
            }

            return this;
        }
    };

    this.Deferred = function() {
        return new Deferred();
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

            if ( def.state == "pending" && length == ++executed ) {
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
        delete this.deferreds[ id ];

        return def.resolve( args );
    };

    this.reject = function( def ) {
        var id = typeof def == "object" ? def.id : def,
            args = slice.call( arguments );

        def = this.deferreds[ id ];

        args.shift();

        delete this.deferreds[ id ];
        return def.reject( args );
    };

    this.fn.register = function() {
        var id = new Date().getTime() + (++counter);

        // FIXME Deferreds in this.deferreds stored almost forever
        this.active = this.deferreds[ id ] = jar.deferreds[ id ] = jar.Deferred();

        this.active.id = id;

        return this.active;
    };

    this.fn.done = function( fn, context ) {
        this.active._add( "done", fn, context || this );
        return this;
    };

    this.fn.fail = function( fn, context ) {
        this.active._add( "fail", fn, context || this );
        return this;
    };

    this.fn.always = function( fn, context ) {
        this.active._add( "always", fn, context || this );
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

            if ( def.state == "pending" ) {
                defs.push( def );

            } else {
                delete this.deferreds[ id ];
            }
        }

        return new Promise( jar.when.apply( this, defs ) );
    };

    function Promise( deferred ) {
        for ( var prop in deferred ) {
            if ( deferred.hasOwnProperty( prop ) ) {
                this[ prop ] = deferred[ prop ];
            }
        }
    }

    promise = Promise.prototype = {
        constructor: Promise
    };

    for ( var i = 0, l = methods.length; i < l; i++ ) {
        name = methods[ i ];
        promise[ name ] = Deferred.prototype[ name ];
    }

}.call( jar );