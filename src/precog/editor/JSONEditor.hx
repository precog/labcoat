package precog.editor;

import precog.editor.codemirror.Externs;
import js.Browser.document;
import js.html.Element;

class JSONEditor implements RegionEditor {
    public var element: Element;
    var editor: CodeMirror;

    public function new(region: Region) {
        var options: Dynamic = {mode: {name: 'javascript', json: true}, region: region};

        element = document.createElement('div');
        editor = CodeMirrorFactory.addTo(element, options);
    }

    public function getContent() {
        return editor.getValue();
    }
    public function setContent(content: String) {
        return editor.setValue(content);
    }

    public function evaluate() {
    }

    public function focus() {
        editor.refresh();
        editor.focus();
    }
}

