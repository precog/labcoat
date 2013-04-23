package precog.app.module.view;

import precog.app.message.*;
import precog.app.message.MenuItem;
import precog.util.Locale;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.editor.*;
import precog.editor.Editor;
import precog.editor.codemirror.Externs;
import precog.editor.codemirror.QuirrelMode;
import jQuery.JQuery;
using thx.react.Promise;

using thx.react.IObservable;
import precog.html.HtmlPanelGroup;
import precog.html.Icons;
import precog.geom.Rectangle;

class EditorModule extends Module {
    var current : Editor;
    var editors : Array<Editor>;
    var communicator : Communicator;
    var locale : Locale;
    var main : HtmlPanelGroup;
    var panels : Map<Editor, HtmlPanelGroupItem>;

    public function new()
    {
        super();
        panels = new Map();
        editors = [];
    }

    override public function connect(communicator: Communicator) {
        this.communicator = communicator;
        communicator
            .demand(MainEditorHtmlPanel)
            .await(communicator.demand(Locale))
            .then(init);
        communicator.on(function(_ : EditorNotebookRequestCreate) createNotebook());
        communicator.on(function(_ : EditorCodeRequestCreate) createCodeEditor());
        communicator.on(function(_ : EditorRequestCloseCurrent) closeEditor());
        communicator.on(function(e : EditorRegionRequestCreate) appendRegion(e.region));
        communicator.on(function(e : EditorUpdate) changeEditor(e.current));

        communicator.queueMany([
            // new MenuItem(MenuEdit(SubgroupEditHistory), "Undo", function(){}, 0),
            // new MenuItem(MenuEdit(SubgroupEditHistory), "Redo", function(){}, 1)
        ]);
    }

    public function init(editorPanel: MainEditorHtmlPanel, locale : Locale) {
        this.locale = locale;

        QuirrelMode.init();

        // Global keyhandlers
        Reflect.setField(CodeMirror.keyMap.macDefault, "Shift-Enter", evaluateRegion);
        Reflect.setField(CodeMirror.keyMap.pcDefault, "Shift-Enter", evaluateRegion);
        Reflect.setField(CodeMirror.keyMap.macDefault, "Cmd-Enter", createRegion);
        Reflect.setField(CodeMirror.keyMap.pcDefault, "Ctrl-Enter", createRegion);

                // TODO: move out from here: TABS!!!
        var rect = new Rectangle();
        editorPanel.panel.rectangle.addListener(rect.updateSize);
        rect.updateSize(editorPanel.panel.rectangle);
        main = new HtmlPanelGroup(editorPanel.panel.element, rect, true);
        main.gutterMargin = 0;
        main.toggleSize = Default;
//        main.toggleType = Primary;
        main.gutterPosition = Top;
        main.events.activate.on(function(panel : HtmlPanelGroupItem) {
            if(null == panel)
                return;
            // silly way of getting back the clicked notebook
            for(editor in editors)
            {
                if(panel != panels.get(editor)) continue;
                communicator.trigger(new EditorUpdate(editor, editors));
                break;
            }
        });
        
        createNotebook();
    }

    var fileCounter: Int = 0;
    function createCodeEditor() {
        var codeEditor = new CodeEditor(locale.format("file #{0}", [++fileCounter]), locale);

        addEditor(codeEditor);
    }

    var notebookCounter : Int = 0;
    function createNotebook() {
        var notebook = new Notebook(locale.format("notebook #{0}", [++notebookCounter]));

        addEditor(notebook);
    }

    function addEditor(editor: Editor) {
        var item = editor.cata(
            function(codeEditor: CodeEditor) return new HtmlPanelGroupItem(codeEditor.name, Icons.file),
            function(notebook: Notebook) return new HtmlPanelGroupItem(notebook.name, Icons.book)
        );

        main.addItem(item);
        panels.set(editor, item);
        item.panel.element.addClass("edit-area");
        item.panel.element.append(editor.element);
        editors.push(editor);

        editor.cata(
            function(codeEditor: CodeEditor) {},
            function(notebook: Notebook) {
                notebook.events.changeName.on(function(old : String, notebook : Notebook) {
                    item.toggle.text = notebook.name;
                });
            }
        );

        communicator.trigger(new EditorUpdate(editor, editors));
        communicator.trigger(new EditorRegionRequestCreate(new Region(QuirrelRegionMode, locale)));
    }

    function changeEditor(editor: Editor) {
        current = editor;
        if(null == current)
            return;
        panels.get(editor).activate();
        current.show();
    }

    function closeEditor() {
        if(null == current)
            return;
        current.clear();
        editors.remove(current);
        var item = panels.get(current);
        panels.remove(current);
        current.cata(
            function(codeEditor: CodeEditor) { /* TODO: Clear CodeEditor events */ },
            function(notebook: Notebook) { notebook.events.clear(); }
        );
        main.removeItem(item);
    }

    function deleteRegion(region: Region) {
        region.events.clear();
        current.cata(
            function(codeEditor: CodeEditor) {},
            function(notebook: Notebook) { notebook.deleteRegion(region); }
        );
    }

    function changeRegionMode(oldRegion: Region, mode: RegionMode) {
        oldRegion.events.clear();

        var content = oldRegion.editor.getContent();
        var region = new Region(mode, locale);
        region.editor.setContent(content);
        appendRegion(region, oldRegion.element);

        deleteRegion(oldRegion);
    }

    function appendRegion(region: Region, ?target: JQuery) {
        region.events.changeMode.on(changeRegionMode);
        region.events.remove.on(deleteRegion);
        current.cata(
            function(codeEditor: CodeEditor) {},
            function(notebook: Notebook) { notebook.appendRegion(region, target); }
        );
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
