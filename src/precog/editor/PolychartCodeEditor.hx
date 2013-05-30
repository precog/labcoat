package precog.editor;

import labcoat.message.PrecogNamedConfig;
import labcoat.message.PrecogRequest;
import labcoat.message.PrecogResponse;
import precog.editor.codemirror.Externs;
import precog.communicator.Communicator;
import jQuery.JQuery;
using StringTools;

class PolychartCodeEditor implements RegionEditor {
    public var element: JQuery;
    var outputElement: JQuery;
    var outputbarElement: JQuery;
    var region: Region;
    var editor: CodeMirror;
    var read : Bool;
    var communicator: Communicator;

    var credential : labcoat.message.PrecogConfig;
    var basePath : String;

    public function new(communicator: Communicator, region: Region) {
        this.communicator = communicator;
        this.region = region;

        communicator.consume(function(data : Array<PrecogNamedConfig>) {
            credential = data[0].config;

            var options: Dynamic = { lineNumbers: true, mode: 'javascript', region: region};
            element = new JQuery('<div class="polychart-code"></div>');
            var editorContainer = new JQuery('<div class="editor"></div>').appendTo(element);
            editor = CodeMirrorFactory.addTo(editorContainer.get(0), options);
            outputbarElement = new JQuery('<div class="outputbar"><div class="buttons dropdown region-type"><button class="btn btn-mini btn-link">chart</button></div><div class="context toolbar"></div></div>').appendTo(element);
            outputElement = new JQuery('<div class="output"><div class="out"></div><div class="data"></div></div>').appendTo(element).find(".data");
        });
    }

    public function getContent() {
        return editor.getValue();
    }

    public function setContent(content: String) {
        return editor.setValue(content);
    }

    public function evaluate() {
        outputElement.children().remove();

        var script = editor.getValue(),
            iframeElement = new JQuery('<iframe class="polychart" frameborder="0" marginheight="0" marginwidth="0"></iframe>').appendTo(outputElement),
            iframe = iframeElement.get(0),
            doc : Dynamic = untyped iframe.contentWindow || iframe.contentDocument;

        communicator.request(
            new RequestFileUpload(region.path(), "text/javascript", script),
            ResponseFileUpload
        );

        var template = PolychartTemplate.HTML;
        template = template.replace("${code}", script);
        template = template.replace("${apiKey}", credential.apiKey);
        template = template.replace("${analyticsService}", credential.analyticsService);
        var path = region.path().split("/").slice(0, -1).join("/");
        template = template.replace("${path}", path);

        if(doc.document) {
            doc = doc.document;
        }
        doc.open();
        doc.write(template);
        doc.close();
    }

    public function focus() {
        editor.refresh();
        editor.focus();
    }
}


class PolychartTemplate
{
    public static var HTML = '
<div id="chart"></div>
<script src="http://localhost/labcoat2/js/precog.js" type="text/javascript"></script>
<script src="http://localhost/labcoat2/js/polychart2.js" type="text/javascript"></script>
<script>
quirrel = function quirrel(params) {
    if("string" === typeof params)
        params = { query : params };

// DYNAMIC VARIABLES
    var path = "$${path}",
        apiKey = "$${apiKey}",
        analyticsService = "$${analyticsService}";
// END OF DYNAMIC VARIABLES

    params.query = params.query.split("/./").join("/"+path).split("\\"./").join("\\"" + path);

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
</script>
<script type="text/javascript">
// DYNAMIC CODE
$${code}
/*
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
*/
// END DYNAMIC CODE
</script>';
}