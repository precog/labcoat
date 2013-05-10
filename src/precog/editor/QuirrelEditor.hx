package precog.editor;

import precog.app.message.PrecogRequest;
import precog.app.message.PrecogResponse;
import precog.communicator.Communicator;
import precog.editor.codemirror.Externs;
import precog.html.HtmlButton;
import precog.html.Icons;
import jQuery.JQuery;

class QuirrelEditor implements RegionEditor {
    public var element: JQuery;
    var outputElement: JQuery;
    var region: Region;
    var communicator: Communicator;
    var editor: CodeMirror;

    public function new(communicator: Communicator, region: Region, editorToolbar: JQuery) {
        this.region = region;
        this.communicator = communicator;

        var options: Dynamic = {lineNumbers: true, mode: 'quirrel', region: region};

        element = new JQuery('<div></div>');

        var editorElement = new JQuery('<div class="editor"></div>').appendTo(element);
        editor = CodeMirrorFactory.addTo(editorElement.get(0), options);

        var runButton = new HtmlButton('run', Icons.play, Mini);
        runButton.element.click(evaluate);
        editorToolbar.append(runButton.element);

        outputElement = new JQuery('<div class="output"></div>').appendTo(element);
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
                outputElement.html('${region.filename}=${haxe.Json.stringify(response.result.data)}');
            });
        });
    }

    public function focus() {
        editor.refresh();
        editor.focus();
    }
}
