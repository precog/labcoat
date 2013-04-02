package precog.app.module.view;

import precog.app.message.*;
import precog.util.Locale;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.editor.*;
import precog.editor.codemirror.Externs;
import precog.editor.codemirror.QuirrelMode;
import jQuery.JQuery;
using thx.react.Promise;

class EditorModule extends Module {
    var element : JQuery;

    var current : Notebook;
    var notebooks : Array<Notebook>;
    var communicator : Communicator;
    var locale : Locale;

    public function new()
    {
        super();
        element = new JQuery('<div class="editor"></div>');
        notebooks = [];
    }

    override public function connect(communicator: Communicator) {
        this.communicator = communicator;
        communicator
            .demand(MainEditorHtmlPanelMessage)
            .await(communicator.demand(Locale))
            .then(init);
        communicator.on(function(_ : EditorNotebookRequestCreate) createNotebook());
        communicator.on(function(_ : EditorNotebookRequestCloseCurrent) closeNotebook());
        communicator.on(function(e : EditorRegionRequestCreate) appendRegion(e.region));
        communicator.on(function(e : EditorNotebookSwitchTo) changeNotebook(e.notebook));
    }

    override public function disconnect(communicator: Communicator) {
        element.remove();
    }

    public function init(editorPanelMessage: MainEditorHtmlPanelMessage, locale : Locale) {
        this.locale = locale;
        editorPanelMessage.value.element.append(element);

        QuirrelMode.init();

        createNotebook();

        // Global keyhandlers
        Reflect.setField(CodeMirror.keyMap.macDefault, "Shift-Enter", evaluateRegion);
        Reflect.setField(CodeMirror.keyMap.pcDefault, "Shift-Enter", evaluateRegion);
        Reflect.setField(CodeMirror.keyMap.macDefault, "Cmd-Enter", createRegion);
        Reflect.setField(CodeMirror.keyMap.pcDefault, "Ctrl-Enter", createRegion);
    }

    function createNotebook() 
    {
        var notebook = new Notebook();
        notebooks.push(notebook);
        changeNotebook(notebook);
        communicator.trigger(new EditorNotebookUpdate(current, notebooks));
        communicator.trigger(new EditorRegionRequestCreate(new Region(QuirrelRegionMode, locale)));
   }

    function changeNotebook(notebook: Notebook) {
        if(current != null) {
            current.element.detach();
        }

        current = notebook;
        element.append(current.element);
        current.show();
    }

    // TODO remove listeners for each region in notebook
    function closeNotebook() {
        current.element.remove();
        notebooks.remove(current);
        changeNotebook(notebooks[0]);

        communicator.trigger(new EditorNotebookUpdate(current, notebooks));
    }

    function deleteRegion(region: Region) {
        region.events.changeMode.off(changeRegionMode);
        region.events.remove.off(deleteRegion);
        current.deleteRegion(region);
    }

    function changeRegionMode(oldRegion: Region, mode: RegionMode) {
        oldRegion.events.changeMode.off(changeRegionMode);
        oldRegion.events.remove.off(deleteRegion);

        var content = oldRegion.editor.getContent();
        var region = new Region(mode, locale);
        region.editor.setContent(content);
        appendRegion(region, oldRegion.element);

        deleteRegion(oldRegion);
    }

    function appendRegion(region: Region, ?target: JQuery) {
        region.events.changeMode.on(changeRegionMode);
        region.events.remove.on(deleteRegion);
        current.appendRegion(region, target);
    }
    
    function createRegion(editor: CodeMirror) {
        var region : Region = editor.getOption('region');
        appendRegion(new Region(region.mode, locale), region.element);
    }

    function evaluateRegion(editor: CodeMirror) {
        var region : Region = editor.getOption('region');
        region.editor.evaluate();
    }
}
