package precog.editor;

import precog.app.message.PrecogRequest;
import precog.app.message.PrecogResponse;
import precog.communicator.Communicator;
import precog.editor.codemirror.Externs;
import js.Browser.document;
import js.html.Element;

class JSONEditor implements RegionEditor {
    public var element: Element;
    var communicator: Communicator;
    var region: Region;
    var editor: CodeMirror;

    public function new(communicator: Communicator, region: Region) {
        this.communicator = communicator;
        this.region = region;

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
        communicator.request(
            new RequestFileUpload(region.path, "application/json", editor.getValue()),
            ResponseFileUpload
        );
    }

    public function focus() {
        editor.refresh();
        editor.focus();
    }
}

