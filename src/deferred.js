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

        // Total amount of callbacks
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

            this.length++;

            return this;
        },

        iterate: function( type, args, i /* internal */ ) {
            var value, always,
                isAlways = type == "always";

            i = i || 0;
            type = this.lists[ type ];

            for ( var l = type.length; i < l; i++ ) {
                value = type[ i ];

                value.fn.apply( value.context || jar, args );

                // call "always" callback
                if ( !isAlways && ( always = this.lists.always[ i ] ) ) {
                    always.fn.apply( value.context || jar, args );
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
    };

    this.Deferred = function() {
        return new Deferred();
    };

    this.when = function() {
        var def = jar.Deferred(),
            executed = 0,
            length = arguments.length;

        if ( !length ) {
            return def
        }

        function executer() {
            if ( length == ++executed ) {
                def.resolve();
            }
        }

        for ( var i = 0; i < length; i++ ) {
            arguments[ i ].done( executer ).fail( def.reject );
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

        this.active = jar.deferreds[ id ] = jar.Deferred();
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

    this.deferreds = {};

}.call( jar );