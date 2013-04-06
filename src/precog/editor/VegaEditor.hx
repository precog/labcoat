package precog.editor;

import precog.editor.codemirror.Externs;
import js.Browser.document;
import js.html.Element;
import precog.editor.vega.Vega;

class VegaEditor implements RegionEditor {
    public var element: Element;
    var outputElement: Element;
    var region: Region;
    var editor: CodeMirror;

    public function new(region: Region) {
        this.region = region;

        var options: Dynamic = {mode: {name: 'javascript', json: true}, region: region};

        element = document.createElement('div');

        editor = CodeMirrorFactory.addTo(element, options);

        outputElement = document.createElement('div');
        outputElement.className = 'output';
        element.appendChild(outputElement);
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
