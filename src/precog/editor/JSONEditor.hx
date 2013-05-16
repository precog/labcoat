package precog.editor;

import labcoat.message.PrecogRequest;
import labcoat.message.PrecogResponse;
import precog.communicator.Communicator;
import precog.editor.codemirror.Externs;
import jQuery.JQuery;

class JSONEditor implements RegionEditor {
    public var element: JQuery;
    var communicator: Communicator;
    var region: Region;
    var editor: TextEditor;

    public function new(communicator: Communicator, region: Region) {
        this.communicator = communicator;
        this.region = region;

        var options: Dynamic = {mode: {name: 'javascript', json: true}, region: region, lineWrapping : true};

        element = new JQuery('<div class="json-editor"><div class="out">${region.filename} :=</div></div>');

//        var area = new TextAreaEditor();
//        area.element.appendTo(element);
//        editor = area;
        editor = CodeMirrorFactory.addTo(element.get(0), options);
        editor.getWrapperElement().className += ' editor';
    }

    public function getContent() {
        return editor.getValue();
    }
    public function setContent(content: String) {
        return editor.setValue(content);
    }

    public function evaluate() {
        communicator.request(
            new RequestFileUpload(region.path(), "application/json", editor.getValue()),
            ResponseFileUpload
        );
    }

    public function focus() {
        editor.refresh();
        editor.focus();
    }
}
