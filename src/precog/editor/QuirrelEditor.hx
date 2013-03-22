package precog.editor;

import precog.editor.codemirror.Externs;
import js.Browser.document;
import js.html.Element;

class QuirrelEditor implements RegionEditor {
    public var element: Element;
    var outputElement: Element;
    var region: Region;
    var editor: CodeMirror;

    public function new(region: Region) {
        this.region = region;

        var options: Dynamic = {lineNumbers: true, mode: 'quirrel', region: region};

        element = document.createElement('div');

        editor = CodeMirrorFactory.addTo(element, options);
        editor.on('focus', editorFocus);
        editor.on('blur', editorBlur);

        outputElement = document.createElement('div');
        outputElement.className = 'output';
        element.appendChild(outputElement);
    }

    function editorFocus(editor: CodeMirror) {
        region.setFocused(true);
    }

    function editorBlur(editor: CodeMirror) {
        region.setFocused(false);
    }

    public function getContent() {
        return editor.getValue();
    }

    public function setContent(content: String) {
        return editor.setValue(content);
    }

    public function evaluate() {
        outputElement.innerHTML = editor.getValue();
    }

    public function focus() {
        editor.refresh();
        editor.focus();
    }
}
