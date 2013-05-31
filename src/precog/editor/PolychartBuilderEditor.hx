package precog.editor;

import labcoat.message.PrecogNamedConfig;
import labcoat.message.PrecogRequest;
import labcoat.message.PrecogResponse;
import precog.editor.codemirror.Externs;
import precog.communicator.Communicator;
import jQuery.JQuery;
import precog.html.HtmlButton;
import precog.html.Icons;
using StringTools;

class PolychartBuilderEditor implements RegionEditor {
    public var element: JQuery;
    var outputElement: JQuery;
    var outputbarElement: JQuery;
    var showHideButton: HtmlButton;
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

            var contextToolbar = outputbarElement.find(".context.toolbar");
            showHideButton = new HtmlButton('', Icons.eyeClose, Mini, true);
            showHideButton.type = Flat;
            showHideButton.element.click(showHideOutput);
            showHideButton.element.addClass('show-hide');
            contextToolbar.append(showHideButton.element);

            outputElement = new JQuery('<div class="output"><div class="out"></div><div class="data"></div></div>').appendTo(element).find(".data");
        });
    }

    function showHideOutput(_) {
        showHideButton.leftIcon = element.find('.output').toggle().is(':visible') ? Icons.eyeClose : Icons.eyeOpen;
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

        var template = PolychartBuilderTemplate.HTML;
        template = template.replace("${code}", script);
        template = template.replace("${apiKey}", credential.apiKey);
        template = template.replace("${analyticsService}", credential.analyticsService);
        var path = region.path().split("/").slice(0, -1).join("/") + "/";
        template = template.replace("${path}", path);
        //TODO use regiions to extract out
        template = template.replace("${outs}", ["out1","out2"].map(function(o) return '"$o"').join(","));

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


class PolychartBuilderTemplate
{
    public static var HTML = '
<script src="poly/dependencies.js"></script>

<script src="poly/data/iris.js"></script>
<script src="poly/data/email.js"></script>
<script src="poly/data/content.js"></script>

<script src="poly/all.js"></script>

<link rel="stylesheet" type="text/css" href="poly/dependencies.css" />
<link rel="stylesheet" type="text/css" href="poly/app.css" />

<div id="chart" class="polychart-ui"></div>
<script>
  poly = require("poly");
  polychart_global = poly.dashboard({
    dom: $("#chart")[0],
    header: false,
    showTutorial: false,
    width: "fill",
    height: "fill",
    demoData: [{
      type: "local",
      tables: [
        {
          name: "Email",
          data: emails,
          meta: {
            id: { type: "num" },
            template_id: { type: "cat" },
            created: { type: "date" },
            success: { type: "cat" },
            message_hash: { type: "cat" },
            source: { type: "cat" }
          }
        },
        {
          name: "Content",
          data: content,
          meta: {
            user_id: { type: "cat" },
            created: { type: "date" },
            dataset_id: { type: "num" },
            title: { type: "cat" },
            public: { type: "cat" },
          }
        },
        {
          name: "Iris",
          data: iris,
          meta: {
            sepalLength: { type: "num" },
            sepalWidth: { type: "num" },
            petalLength: { type: "num" },
            petalWidth: { type: "num" },
            category: { type: "cat" },
          }
        },
      ],
    }]
  });
</script>';
}
