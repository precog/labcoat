package precog.editor;

import precog.app.message.PrecogRequest;
import precog.app.message.PrecogResponse;
import precog.communicator.Communicator;
import precog.editor.codemirror.Externs;
import js.Browser.document;
import js.html.Element;

class QuirrelEditor implements RegionEditor {
    public var element: Element;
    var outputElement: Element;
    var region: Region;
    var communicator: Communicator;
    var editor: CodeMirror;

    public function new(communicator: Communicator, region: Region) {
        this.region = region;
        this.communicator = communicator;

        var options: Dynamic = {lineNumbers: true, mode: 'quirrel', region: region};

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
        editor.setValue(content);
    }

    public function evaluate() {
        communicator.request(
            new RequestFileUpload(region.path(), "text/x-quirrel-script", editor.getValue()),
            ResponseFileUpload
        ).then(function(response: ResponseFileUpload) {
            return communicator.request(
                new RequestFileExecute(region.path()),
                ResponseFileExecute
            ).then(function(response: ResponseFileExecute) {
                outputElement.innerHTML = '${region.filename}=${haxe.Json.stringify(response.result.data)}';
            });
        });
    }

    public function focus() {
        editor.refresh();
        editor.focus();
    }
}
