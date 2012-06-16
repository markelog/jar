!function() {
    this.filters = {
            json: JSON.parse,

            javascript: window.execScript || eval,

            // from jQuery
            xml: function( data ) {
                if ( typeof data !== "string" || !data ) {
                    return null;
                }

                var xml;

                try {
                    if ( window.DOMParser ) {
                        xml = new window.DOMParser().parseFromString( data , "text/xml" );

                    } else { // IE

                        xml = new window.ActiveXObject( "Microsoft.XMLDOM" );
                        xml.async = "false";
                        xml.loadXML( data );
                    }
                } catch( e ) {}

                if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
                    throw "Invalid XML: " + data;
                }

                return xml;
            },

            text: function( data ) {
                return data;
            },

            html: function() {
                var div;
                document.createDocumentFragment().appendChild( div = document.createElement( "div" ) );

                return function( data ) {
                    return div.innerHTML = data;
                };
            }()
    };

    this.serializations = {
        json: JSON.stringify,
        text: function( text ) {
            return text;
        }
    };

}.call( jar );