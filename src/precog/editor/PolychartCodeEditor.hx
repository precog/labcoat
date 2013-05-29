package precog.editor;

import precog.editor.codemirror.Externs;
import jQuery.JQuery;

class PolychartCodeEditor implements RegionEditor {
    public var element: JQuery;
    var outputElement: JQuery;
    var region: Region;
    var editor: CodeMirror;

    public function new(region: Region) {
        this.region = region;

        var options: Dynamic = { lineNumber: true, mode: {name: 'javascript', json: false}, region: region};

        element = new JQuery('<div></div>');

        editor = CodeMirrorFactory.addTo(element.get(0), options);

        outputElement = new JQuery('<div class="output"><iframe></iframe></div>').appendTo(element);
    }

    public function getContent() {
        return editor.getValue();
    }

    public function setContent(content: String) {
        return editor.setValue(content);
    }

    public function evaluate() {
        trace("evaluate");
        var script = editor.getValue();
//        jQuery.JQueryStatic.globalEval(script);

        var html = PolychartTemplate.HTML;

        outputElement.find("iframe").contents().find("html").html(html);
    }

    public function focus() {
        editor.refresh();
        editor.focus();
    }
}


class PolychartTemplate
{
    public static var HTML = '<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Polychart</title>
<script src="js/precog.js"></script>
<script src="js/polychart2.js"></script>
<script>
(function(exp) {
    exp.quirrel = function quirrel(params) {
        if("string" === typeof params)
            params = { query : params };

// DYNAMIC VARIABLES
        var path = "/0000000094/",
            apiKey = "D99DFC4E-91F4-4F3A-BB07-51F0A5109F16",
            analyticsService = "https://nebula.precog.com";
// END OF DYNAMIC VARIABLES

        params.query = params.query.split("/./").join("/"+path).split("\"./").join("\"" + path);

        var api = new Precog.api({ analyticsService : analyticsService, apiKey : apiKey });

        return polyjs.data.api(function quirrelApiFunction(requestParams, callback) {
            api.execute(params).then(
                function(data) {
                    callback(undefined, { data : data.data });
                },
                function(err) {
                    callback(err);
                }
            );
        });
    };
})(window);
</script>
<script>
function init()
{
    var loader = function() {
        document.getElementById("chart").removeEventListener("DOMNodeInserted", loader, false);
        document.getElementById("loader").remove();
        
    };
    document.getElementById("chart").addEventListener("DOMNodeInserted", loader, false);

// DYNAMIC CODE
    polyjs.chart({
        title: "Lord of the Rings Box Office Gross",
        dom: "chart",
        width: 720,
        layer: {
            data: quirrel("/./test"),
            type: "bar",
            x: "movie",
            y: "gross",
            color: { const: "darkred" }
        }
    });
// END DYNAMIC CODE
}
</script>
</head>
<body onload="init()">
    <div id="chart"><div id="loader">LOADING ...</div></div>
</body>
</html>';
}
