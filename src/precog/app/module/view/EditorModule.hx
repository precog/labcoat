package precog.app.module.view;

import precog.app.message.*;
import precog.app.message.PrecogRequest;
import precog.app.message.PrecogResponse;
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
    var accountId : String;

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
        communicator.on(function(_ : EditorNotebookRequestCreate)
            createNotebook());
        communicator.on(function(_ : EditorCodeRequestCreate)
            createCodeEditor());
        communicator.on(function(_ : EditorRequestCloseCurrent)
            closeEditor());
        communicator.on(function(e : EditorRegionRequestCreate)
            createRegion(e.regionMode));
        communicator.on(function(e : EditorSave)
            saveEditor());
        communicator.on(function(e : EditorUpdate)
            changeEditor(e.current));

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
        Reflect.setField(CodeMirror.keyMap.macDefault, "Cmd-Enter", createRegionFromEditor);
        Reflect.setField(CodeMirror.keyMap.pcDefault, "Ctrl-Enter", createRegionFromEditor);

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

        communicator.consume(function(configs : Array<PrecogNamedConfig>) {
            // TODO: Maybe check this is the "default" account
            accountId = configs[0].config.accountId;
            loadNotebooks();
        });
    }

    function loadNotebooks() {
        var path = '${accountId}/temp/notebooks';
        communicator.request(
            new RequestMetadataChildren(path),
            ResponseMetadataChildren
        ).then(function(response: ResponseMetadataChildren) {
            for(file in response.children) {
                if(file.type != 'directory') continue;
                openNotebook('${path}/${file.name}');
            }
        });
    }

    var fileCounter: Int = 0;
    function createCodeEditor() {
        var codeEditor = new CodeEditor(communicator, locale.format("file #{0}", [++fileCounter]), locale);

        addEditor(codeEditor);
    }

    var notebookCounter : Int = 0;
    function openNotebook(path: String) {
        var notebook = new Notebook(communicator, path, locale.format("notebook #{0}", [notebookCounter]), locale);

        addEditor(notebook);
    }

    function createNotebook() {
        ++notebookCounter;
        openNotebook('${accountId}/temp/notebooks/notebook${notebookCounter}');
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

    function saveEditor() {
        current.save('${accountId}');
    }

    function deleteRegion(region: Region) {
        current.cata(
            function(codeEditor: CodeEditor) {
                // Can't delete regions in a single editor
            },
            function(notebook: Notebook) { notebook.deleteRegion(region); }
        );
    }

    function changeRegionMode(oldRegion: Region, mode: RegionMode) {
        current.cata(
            function(codeEditor: CodeEditor) {
                // Can't change single editor modes
            },
            function(notebook: Notebook) { notebook.changeRegionMode(oldRegion, mode); }
        );
    }

    function appendRegion(region: Region, notebook: Notebook, ?target: JQuery) {
        notebook.appendRegion(region, target);
    }

    function createRegion(regionMode: RegionMode, ?target: JQuery) {
        current.cata(
            function(codeEditor: CodeEditor) {
                // Can't create regions in a single editor
            },
            function(notebook: Notebook) { notebook.createRegion(regionMode, target); }
        );
    }
    
    function createRegionFromEditor(editor: CodeMirror) {
        var region : Region = editor.getOption('region');
        createRegion(region.mode, region.element);
    }

    function evaluateRegion(editor: CodeMirror) {
        var region : Region = editor.getOption('region');
        region.editor.evaluate();
    }
}
