package precog.editor;

import precog.app.message.MainEditorHtmlPanelMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.editor.codemirror.Externs;
import precog.editor.codemirror.QuirrelMode;
import jQuery.JQuery;

class EditorModule extends Module {
    public static var element: JQuery = new JQuery('<div class="editor"></div>');

    static var current: Notebook;
    static var notebooks: Array<Notebook> = [];

    override public function connect(communicator: Communicator) {
        communicator.demand(MainEditorHtmlPanelMessage).then(init);
    }

    override public function disconnect(communicator: Communicator) {
        element.remove();
    }

    public function init(editorPanelMessage: MainEditorHtmlPanelMessage) {
        editorPanelMessage.value.element.append(element);

        QuirrelMode.init();

        insertNotebook();

        // Global keyhandlers
        Reflect.setField(CodeMirror.keyMap.macDefault, "Shift-Enter", evaluateRegion);
        Reflect.setField(CodeMirror.keyMap.pcDefault, "Shift-Enter", evaluateRegion);
        Reflect.setField(CodeMirror.keyMap.macDefault, "Cmd-Enter", insertRegion);
        Reflect.setField(CodeMirror.keyMap.pcDefault, "Ctrl-Enter", insertRegion);
    }

    public static function insertNotebook() {
        var notebook = new Notebook();
        notebooks.push(notebook);
        changeNotebook(notebook);

        ToolbarModule.updateNotebooks(current, notebooks);
    }

    public static function changeNotebook(notebook: Notebook) {
        if(current != null) {
            current.element.detach();
        }

        current = notebook;
        element.append(current.element);
        current.show();
    }

    public static function closeNotebook() {
        current.element.remove();
        notebooks.remove(current);
        changeNotebook(notebooks[0]);

        ToolbarModule.updateNotebooks(current, notebooks);
    }

    public static function deleteRegion(region: Region) {
        current.deleteRegion(region);
    }

    public static function changeRegionMode(oldRegion: Region, mode: RegionMode) {
        var content = oldRegion.editor.getContent();
        var region = new Region(mode);
        region.editor.setContent(content);
        appendRegion(region, oldRegion.element);

        deleteRegion(oldRegion);
    }

    public static function appendRegion(region: Region, ?target: JQuery) {
        current.appendRegion(region, target);
    }

    static function insertRegion(editor: CodeMirror) {
        var region: Region = editor.getOption('region');
        current.appendRegion(new Region(region.mode), region.element);
    }

    static function evaluateRegion(editor: CodeMirror) {
        var region: Region = editor.getOption('region');
        region.editor.evaluate();
    }
}
