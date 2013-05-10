package precog.editor;

import precog.editor.codemirror.Externs;
import precog.editor.vega.Vega;
import jQuery.JQuery;

class VegaEditor implements RegionEditor {
    public var element: JQuery;
    var outputElement: JQuery;
    var region: Region;
    var editor: CodeMirror;

    public function new(region: Region) {
        this.region = region;

        var options: Dynamic = { lineNumber: true, mode: {name: 'javascript', json: true}, region: region};

        element = new JQuery('<div></div>');

        editor = CodeMirrorFactory.addTo(element.get(0), options);

        outputElement = new JQuery('<div class="output"></div>').appendTo(element);
    }

    public function getContent() {
        return editor.getValue();
    }

    public function setContent(content: String) {
        return editor.setValue(content);
    }

    public function evaluate() {
        trace("evaluate");
        Vega.parse.spec(haxe.Json.parse(editor.getValue()),
            function(chart) {
                chart({el:outputElement}).update();
            });
    }

    public function focus() {
        editor.refresh();
        editor.focus();
    }
}
