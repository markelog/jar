!function() {
    var xml,
        gEval = window.execScript || eval;

    if ( window.XMLSerializer ) {
        xml = function( node ) {
            if ( typeof node != "string" ) {
                    return new window.XMLSerializer().serializeToString( node );
                }

                return node;
        };

    // Old IE
    } else {
        xml = function( node ) {

            // We can receive string as an argument, if we do, just return the same argument
            return node.xml ? node.xml : node.outerHTML || node;
        };
    }

    this.filters = {
        json: JSON.parse,

        javascript: function( data ) {
            gEval( data );
            return data;
        },

        // from jQuery
        xml: function( data ) {
            var xml;

            if ( typeof data !== "string" || !data ) {
                return null;
            }

            try {
                if ( window.DOMParser ) {
                    xml = new window.DOMParser().parseFromString( data , "text/xml" );

                } else { // IE

                    xml = new window.ActiveXObject( "Microsoft.XMLDOM" );
                    xml.async = "false";
                    xml.loadXML( data );
                }
            } catch( _ ) {}

            if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
                throw "Invalid XML: " + data;
            }

            return xml;
        },

        text: function( data ) {
            return data;
        },

        html: function() {
            var doc = document.createElement( "div" );

            return function( data ) {
                doc.innerHTML = data;

                return doc.firstChild;
            };
        }()
    };

    this.filters.js = this.filters.javascript;

    this.executable = {
        javascript: true,
        js: true
        //css: true - not right now
    };

    this.text = {
        json: JSON.stringify,
        xml: xml,
        text: window.String,
    };

    this.text.js = this.text.javascript = this.text.text;
    this.text.html = this.text.xml;

}.call( jar );