package labcoat.module.view;

import haxe.ds.Option;
import jQuery.Event;
import jQuery.JQuery;
import labcoat.config.ViewConfig;
import labcoat.message.*;
import labcoat.message.MenuItem;
import labcoat.message.PrecogRequest;
import labcoat.message.PrecogResponse;
import labcoat.message.RegionDrag;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.editor.*;
import precog.editor.Editor;
import precog.editor.RegionMode;
import precog.editor.codemirror.Externs;
import precog.editor.codemirror.QuirrelMode;
import precog.geom.Rectangle;
import precog.html.Bootstrap;
import precog.html.HtmlButton;
import precog.html.HtmlDropdown;
import precog.html.HtmlPanel;
import precog.html.HtmlPanelGroup;
import precog.html.Icons;
import precog.util.Locale;

using StringTools;
using thx.react.IObservable;
using thx.react.Promise;

class EditorModule extends Module {
    var current : Editor;
    var editors : Array<Editor>;
    var communicator : Communicator;
    var locale : Locale;
    var main : HtmlPanelGroup;
    var panels : Map<Editor, HtmlPanelGroupItem>;

    var accountId : String;
    var tmpPath : String;
    var remoteMetadataPath : String;
    var localMetadataKey : String;
    var currentDirectory : String;

    var fileCounter : Int = 0;
    var notebookCounter : Int = 0;

    var dragEvent : Option<RegionDrag>;
    var dragToEvent : Option<RegionDragTo>;

    public function new()
    {
        super();
        panels = new Map();
        editors = [];

        dragEvent = None;
        dragToEvent = None;
    }

    override public function connect(communicator: Communicator) {
        this.communicator = communicator;
        communicator
            .demand(MainEditorHtmlPanel)
            .await(communicator.demand(Locale))
            .then(init);
        communicator.on(function(e : EditorOpenNotebook)
            openNotebook(e.path));
        communicator.on(function(e : EditorOpenFile)
            getContentTypeOpenCodeEditor(e.path));
        communicator.on(function(e : EditorUpdate)
            changeEditor(e.current));
        communicator.on(function(e : EditorSave)
            updateTab(e.from, e.to));
        communicator.on(function(e : ResponseDirectoryDelete)
            closeDeleted(e.path));
        communicator.on(function(e : RegionDrag)
            storeDrag(e));
        communicator.on(function(e : RegionDragTo)
            storeDragTo(e));

        communicator.queueMany([
            // new MenuItem(MenuEdit(SubgroupEditHistory), "Undo", function(){}, 0),
            // new MenuItem(MenuEdit(SubgroupEditHistory), "Redo", function(){}, 1)
        ]);

        communicator.on(function(_ : NodeDeselected) {
            setCurrentDirectory(null);
        });

        communicator.on(setCurrentDirectory);
    }

    public function init(editorPanel: MainEditorHtmlPanel, locale : Locale) {
        this.locale = locale;

        QuirrelMode.init();

        // Global keyhandlers
        Reflect.setField(CodeMirror.keyMap.basic, "Shift-Up", "goLineUp");
        Reflect.setField(CodeMirror.keyMap.basic, "Shift-Down", "goLineDown");
        Reflect.setField(CodeMirror.keyMap.basic, "Up", moveUpAcrossRegions);
        Reflect.setField(CodeMirror.keyMap.basic, "Down", moveDownAcrossRegions);
        Reflect.setField(CodeMirror.keyMap.basic, "Shift-Enter", evaluateRegion);
        Reflect.setField(CodeMirror.keyMap.macDefault, "Cmd-Enter", createRegionFromEditor);
        Reflect.setField(CodeMirror.keyMap.pcDefault, "Ctrl-Enter", createRegionFromEditor);

        var rect = new Rectangle();
        editorPanel.panel.rectangle.addListener(rect.updateSize);
        rect.updateSize(editorPanel.panel.rectangle);
        main = new HtmlPanelGroup(editorPanel.panel.element, rect, [
            DropdownButton('new notebook', '', function(e: Event) {
                createNotebook();
            }),
            DropdownButton('new quirrel file', '', function(e: Event) {
                createCodeEditor(QuirrelRegionMode);
            }),
            DropdownButton('new markdown file', '', function(e: Event) {
                createCodeEditor(MarkdownRegionMode);
            }),
            DropdownButton('new json file', '', function(e: Event) {
                createCodeEditor(JSONRegionMode);
            })
        ]);
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
            setCurrentDirectory(null);
            tmpPath = '${accountId}/temp';
            remoteMetadataPath = '${tmpPath}/metadata.json';
            localMetadataKey = 'labcoat.editor.metadata';
            loadMetadata();
            loadTempFiles();
        });
    }

    function setCurrentDirectory(node : NodeSelected)
    {
        if(null == node)
            currentDirectory = "/" + accountId;
        else
            currentDirectory = if(node.type == Directory) node.path else {
                var segments = node.path.split('/');
                segments.pop();
                segments.join('/');
            }
    }

    function loadTempFiles() {
        trace('TODO: Open all files under ${tmpPath}');
    }

    // Load metadata
    function loadMetadata() {
        loadRemoteMetadata();
        loadLocalMetadata();
    }

    function loadRemoteMetadata() {
        communicator.request(
            new RequestFileGet(remoteMetadataPath),
            ResponseFileGet
        ).then(thx.core.Procedure.ProcedureDef.fromArity1(function(response: ResponseFileGet) {
            var metadata = haxe.Json.parse(response.content.contents)[0];

            fileCounter = metadata.fileCounter;
            notebookCounter = metadata.notebookCounter;
        }));
    }

    function loadLocalMetadata() {
        var ls = js.Browser.getLocalStorage();
        var metadata = haxe.Json.parse(ls.getItem(localMetadataKey));

        if(metadata == null) {
            createNotebook();
            return;
        }

        var editors: Array<{type: String, path: String}> = metadata.editors;
        for(editor in editors) {
            switch(editor.type) {
            case 'CodeEditor': getContentTypeOpenCodeEditor(editor.path).then(function(_) {
                // Hack: this is async so keep trying to open what current should be when finished
                openExisting(metadata.current.path);
            });
            case 'Notebook': openNotebook(editor.path);
            }
        }

        openExisting(metadata.current.path);
    }

    // Save metadata
    function saveMetadata() {
        saveRemoteMetadata();
        saveLocalMetadata();
    }

    function saveRemoteMetadata() {
        communicator.request(
            new RequestFileUpload(remoteMetadataPath, 'application/json', serializeRemoteMetadata()),
            ResponseFileUpload
        );
    }

    function saveLocalMetadata() {
        var ls = js.Browser.getLocalStorage();
        ls.setItem(localMetadataKey, serializeLocalMetadata());
    }

    // Serialize metdata
    function serializeRemoteMetadata() {
        return haxe.Json.stringify({
            fileCounter: fileCounter,
            notebookCounter: notebookCounter
        });
    }

    function serializeEditor(e: Editor) {
        if(e == null)
            return null;

        return {
            type: e.cata(
                function(codeEditor: CodeEditor) return 'CodeEditor',
                function(notebook: Notebook) return 'Notebook'
            ),
            path: e.path
        }
    }

    function serializeLocalMetadata() {
        return haxe.Json.stringify({
            editors: editors.map(serializeEditor),
            current: serializeEditor(current)
        });
    }

    function contentTypeToRegionMode(contentType: String) {
        return switch(contentType) {
        case 'application/json': JSONRegionMode;
        case 'text/x-markdown': MarkdownRegionMode;
        case 'text/x-quirrel-script': QuirrelRegionMode;
        case _: throw 'Bad content type ${contentType}: no editor mode available';
        }
    }

    function getContentTypeOpenCodeEditor(path: String) {
        return communicator.request(
            new RequestFileGet(path),
            ResponseFileGet
        ).then(thx.core.Procedure.ProcedureDef.fromArity1(function(response: ResponseFileGet) {
            openCodeEditor(path, contentTypeToRegionMode(response.content.type));
        }));
    }

    function existingEditor(path: String) {
        for(editor in editors) {
            if(editor.path == path) return editor;
        }
        return null;
    }

    function openExisting(path: String) {
        var existing = existingEditor(path);

        if(existing != null) {
            communicator.trigger(new EditorUpdate(existing, editors));
            return true;
        }

        return false;
    }

    function openCodeEditor(path: String, mode: RegionMode) {
        if(openExisting(path)) return;
        var codeEditor = new CodeEditor(communicator, path, mode, locale);
        addEditor(codeEditor);
    }

    function createCodeEditor(mode: RegionMode) {
        ++fileCounter;
        openCodeEditor('${tmpPath}/code/file${fileCounter}', mode);
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

    function tabButton(editor: Editor) {
        var save = new HtmlButton(locale.singular('save'), Icons.save, Mini, true);
        save.element.click(function(event: Event) {
            event.preventDefault();
            current.save(current.path);
        });

        var filename = editor.path.split('/').pop();
        var item = editor.cata(
            function(codeEditor: CodeEditor) return new HtmlPanelGroupItem(filename, Icons.file),
            function(notebook: Notebook) return new HtmlPanelGroupItem(filename, Icons.book)
        );
        item.toggle.rightIcon = 'remove';
        item.toggle.element.find('.right-icon').click(function(_: jQuery.Event) {
            closeEditor(editor);
        });

        var containers = new ToolbarContainers(item, ViewConfig.mainToolbarHeight, ViewConfig.mainToolbarMargin);

        containers.toolbar.element.addClass("main-toolbar");
        containers.main.element.append(editor.element);
        containers.main.element.addClass("edit-area");

        // TODO: Stop using catamorphisms in EditorModule for
        // polymorphism. Add these details to each editor.
        editor.cata(
            function(codeEditor: CodeEditor) {},
            function(notebook: Notebook) {
                var group = new JQuery('<div class="btn-group"></div>');
                for(mode in Type.allEnums(RegionMode)) {
                    var button = new HtmlButton(RegionModes.toEnglish(mode), Mini);
                    button.element.click(function(event: Event) {
                        event.preventDefault();
                        createRegion(mode);
                    });
                    button.element.appendTo(group);
                }
                group.appendTo(containers.toolbar.element);
            }
        );

        var saveAs = new JQuery('<a href="#">Save as...</a>').click(function(event: Event) {
            event.preventDefault();

            Dialog.prompt(locale.format("Current directory: <code>{0}</code><br>Save file as:", [currentDirectory]), function(filename: String) {
                var directory = if(currentDirectory == '/') '' else currentDirectory;
                current.save('${directory}/${filename}');
            });
        });

        var btnGroup = new JQuery('<div class="btn-group"></div>').appendTo(containers.toolbar.element);
        save.element.appendTo(btnGroup);
        new JQuery('<button class="btn btn-mini dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>').appendTo(btnGroup);
        new JQuery('<ul class="dropdown-menu"><li></li></ul>').appendTo(btnGroup).find('li').append(saveAs);

        return item;
    }

    function addEditor(editor: Editor) {
        var item = tabButton(editor);
        main.addItem(item);
        panels.set(editor, item);
        editors.push(editor);

        communicator.trigger(new EditorUpdate(editor, editors));
    }

    function changeEditor(editor: Editor) {
        current = editor;
        saveLocalMetadata();
        if(null == current)
            return;
        panels.get(editor).activate();
        current.show();
    }

    function updateTab(from: String, to: String) {
        for(editor in panels.keys()) {
            if(editor.path == from) {
                var filename = to.split('/').pop();
                panels[editor].toggle.text = filename;
            }
        }
    }

    function closeDeleted(path: String) {
        for(editor in editors) {
            if(!'/${editor.path}'.startsWith(path + '/') && editor.path != path)
                continue;
            closeEditor(editor);
        }
    }

    function closeEditor(editor: Editor) {
        editor.clear();
        editors.remove(editor);
        var item = panels.get(editor);
        panels.remove(editor);
        editor.cata(
            function(codeEditor: CodeEditor) { /* TODO: Clear CodeEditor events */ },
            function(notebook: Notebook) { notebook.events.clear(); }
        );
        main.removeItem(item);
        saveMetadata();
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

    function storeDrag(drag: RegionDrag) {
        dragEvent = Some(drag);
        liftA2(moveToRegion, dragEvent, dragToEvent);
    }

    function storeDragTo(dragTo: RegionDragTo) {
        dragToEvent = Some(dragTo);
        liftA2(moveToRegion, dragEvent, dragToEvent);
    }

    // Applicative liftA2 with concreted to two Options.
    function liftA2<A, B, C>(f: A -> B -> C, oa: Option<A>, ob: Option<B>) {
        return switch oa {
            case Some(a): switch(ob) {
                case Some(b): Some(f(a, b));
                case _: None;
            }
            case _: None;
        }
    }

    function moveToRegion(drag: RegionDrag, dragTo: RegionDragTo) {
        current.cata(
            function(codeEditor: CodeEditor) {},
            function(notebook: Notebook) notebook.moveToRegion(drag.region, dragTo.region)
        );

        dragEvent = None;
        dragToEvent = None;
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
