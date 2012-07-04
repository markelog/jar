!function() {
    var proto,
        counter = 0,
        slice = [].slice;

    function Deferred() {
        this.lists = {
            done: [],
            fail: [],
            always: []
        };

        // Total amount of called callbacks
        this.length = 0;
        this.state = "pending";

        return this;
    }

    Deferred.prototype = {
        constructor: Deferred,

        add: function( type, fn, context ) {
            var state;
            context = context || jar;

            if ( !fn ) {
                return this;
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

        iterate: function( type, args, i /* internal */ ) {
            var value, always,
                isAlways = type == "always";

            i = i || 0;
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
                this.iterate( "always", args, i );
            }

            return this;
        },

        resolve: function( args ) {
            if ( this.state == "pending" ) {
                this.state = "resolved";
                this.iterate( "done", this.args = args );
            }

            return this;
        },

        reject: function( args ) {
            if ( this.state == "pending" ) {
                this.state = "rejected";
                this.iterate( "fail", this.args = args );
            }

            return this;
        },

        done: function( fn, context ) {
            return this.add( "done", fn, context || this.context );
        },

        always: function( fn, context ) {
            return this.add( "always", fn, context || this.context );
        },

        fail: function( fn, context ) {
            return this.add( "fail", fn, context || this.context );
        },

        then: function( success, error, context ) {
            if ( typeof error == "function" ) {
                this.add( "done", success, context || this.context )
                    .add( "fail", error, context || this.context );

            } else {
                this.add( "done", success, error || this.context );
            }

            return this;
        }
    };

    this.Deferred = function() {
        return new Deferred();
    };

    this.when = function() {
        var def = jar.Deferred(),
            executed = 0,
            length = arguments.length;

        def.context = this;

        if ( !length ) {
            return def.resolve();
        }

        function done() {
            if ( def.state == "pending" && length == ++executed ) {
                def.resolve();
            }
        }

        function reject() {
            def.reject();
        }

        for ( var i = 0; i < length; i++ ) {
            arguments[ i ].always( done, this ).fail( reject, this );
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

        // FIXME this.deferreds stored almost forever
        this.active = this.deferreds[ id ] = jar.deferreds[ id ] = jar.Deferred();

        this.active.id = id;

        return this.active;
    };

    this.fn.done = function( fn, context ) {
        this.active.add( "done", fn, context || this );
        return this;
    };

    this.fn.fail = function( fn, context ) {
        this.active.add( "fail", fn, context || this );
        return this;
    };

    this.fn.always = function( fn, context ) {
        this.active.add( "always", fn, context || this );
        return this;
    };

    this.fn.then = function() {
        this.active.then.apply( this.active, arguments );
        return this;
    };

    this.deferreds = {};

    this.fn.promise = function() {
        var def = jar.Deferred(),
            defs = [];

        for ( var id in this.deferreds ) {
            def = this.deferreds[ id ];

            if ( def.state == "pending" ) {
                defs.push( def );

            } else {
                delete this.deferreds[ id ];
            }
        }

        return jar.when.apply( this, defs );
    };
}.call( jar );