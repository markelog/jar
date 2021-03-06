!function() {
    var xml, js,
        head = document.head || document.getElementsByTagName( "head" )[ 0 ],
        gEval = window.execScript || eval;

    if ( window.XMLSerializer ) {
        xml = function( node ) {
            if ( typeof node != "string" ) {
                return node.xml || new window.XMLSerializer().serializeToString( node );
            }

            return node;
        };

    // Old IE
    } else {

        // We can receive string as an argument, if we do, just return the same argument
        xml = function( node ) {
            return node.xml ? node.xml : node.outerHTML || node;
        };
    }

    js = function( data ) {
        gEval( data );
        return data;
    };

    this.filters = {
        json: window.JSON ? window.JSON.parse : js,

        javascript: js,

        css: function( data ) {
            var style = document.createElement( "style" );

            // We have to append style element before write styles inside
            // sometimes ie will get confuse
            // TODO: invistegate and add test for it
            head.appendChild( style );

            if ( style.styleSheet === undefined ) {
                style.innerHTML = data;

            // for IE
            } else {
                style.type = "text/css";
                style.styleSheet.cssText = data;
            }

            return style;
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

        text: window.String,

        html: function() {
            var doc = document.createElement( "div" );

            return function( data ) {
                doc.innerHTML = data;

                return doc.firstChild;
            };
        }()
    };

    this.filters.js = this.filters.javascript;

    this.text = {
        json: window.JSON ? window.JSON.stringify : null,
        xml: xml,
        text: window.String
    };

    this.text.js = this.text.javascript = this.text.css = this.text.text;
    this.text.html = this.text.xml;

    jar.type = function( data ) {
        var documentElement, nodeName;

        if ( typeof data == "string" ) {
            return "text";
        }

        if ( !data ) {
            return;
        }

        documentElement = ( data.ownerDocument || data ).documentElement;
        nodeName = documentElement && documentElement.nodeName.toLowerCase();

        if ( nodeName ) {
            if ( nodeName !== "html" ) {
                return "xml";
            }

            return "html";
        }

        if ( typeof data == "object" ) {
            return "json";
        }

        return "text";
    };

}.call( jar );