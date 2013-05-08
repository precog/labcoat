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
    var tmpPath : String;
    var metadataPath : String;

    var fileCounter : Int = 0;
    var notebookCounter : Int = 0;

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
        Reflect.setField(CodeMirror.keyMap.basic, "Up", moveUpAcrossRegions);
        Reflect.setField(CodeMirror.keyMap.basic, "Down", moveDownAcrossRegions);
        Reflect.setField(CodeMirror.keyMap.basic, "Shift-Enter", evaluateRegion);
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
            tmpPath = '${accountId}/temp';
            metadataPath = '${tmpPath}/metadata.json';
            loadMetadata();
        });
    }

    function loadMetadata() {
        communicator.request(
            new RequestFileGet(metadataPath),
            ResponseFileGet
        ).then(function(response: ResponseFileGet) {
            var metadata = haxe.Json.parse(response.content.contents)[0];
            if(metadata == null) {
                // TODO: Open a new notebook
                createNotebook();
                return;
            }

            fileCounter = metadata.fileCounter;
            notebookCounter = metadata.notebookCounter;

            var editors: Array<{type: String, path: String}> = metadata.editors;
            for(editor in editors) {
                switch(editor.type) {
                case 'CodeEditor': openCodeEditor(editor.path);
                case 'Notebook': openNotebook(editor.path);
                }
            }
        });
    }

    function saveMetadata() {
        communicator.request(
            new RequestFileUpload(metadataPath, 'application/json', serializeMetadata()),
            ResponseFileUpload
        );
    }

    function serializeMetadata() {
        return haxe.Json.stringify({
            editors: editors.map(function(e: Editor) return {
                type: e.cata(
                    function(codeEditor: CodeEditor) return 'CodeEditor',
                    function(notebook: Notebook) return 'Notebook'
                ),
                path: e.path
            }),
            fileCounter: fileCounter,
            notebookCounter: notebookCounter
        });
    }

    function openCodeEditor(path: String) {
        var codeEditor = new CodeEditor(communicator, path, locale);
        addEditor(codeEditor);
    }

    function createCodeEditor() {
        ++fileCounter;
        openCodeEditor('${tmpPath}/code/file${fileCounter}');
        saveMetadata();
    }

    function openNotebook(path: String) {
        var notebook = new Notebook(communicator, path, locale);
        addEditor(notebook);
    }

    function createNotebook() {
        ++notebookCounter;
        openNotebook('${tmpPath}/notebooks/notebook${notebookCounter}');
        saveMetadata();
    }

    function addEditor(editor: Editor) {
        var filename = editor.path.split('/').pop();
        var item = editor.cata(
            function(codeEditor: CodeEditor) return new HtmlPanelGroupItem(filename, Icons.file),
            function(notebook: Notebook) return new HtmlPanelGroupItem(filename, Icons.book)
        );

        main.addItem(item);
        panels.set(editor, item);
        item.panel.element.addClass("edit-area");
        item.panel.element.append(editor.element);
        editors.push(editor);

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
        saveMetadata();
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

    function moveUpAcrossRegions(editor: CodeMirror) {
        current.cata(
            function(codeEditor: CodeEditor) {},
            function(notebook: Notebook) {
                if(editor.getCursor("start").line != editor.firstLine()) return;
                var region: Region = editor.getOption('region');
                notebook.focusPreviousRegion(region);
            }
        );
        editor.moveV(-1, "line");
    }

    function moveDownAcrossRegions(editor: CodeMirror) {
        current.cata(
            function(codeEditor: CodeEditor) {},
            function(notebook: Notebook) {
                if(editor.getCursor("end").line != editor.lastLine()) return;
                var region: Region = editor.getOption('region');
                notebook.focusNextRegion(region);
            }
        );
        editor.moveV(1, "line");
    }

    function evaluateRegion(editor: CodeMirror) {
        var region : Region = editor.getOption('region');
        region.editor.evaluate();
    }
}
