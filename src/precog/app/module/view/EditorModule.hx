package precog.app.module.view;

import precog.app.message.*;
import precog.app.message.MenuItemMessage;
import precog.util.Locale;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.editor.*;
import precog.editor.codemirror.Externs;
import precog.editor.codemirror.QuirrelMode;
import jQuery.JQuery;
using thx.react.Promise;

using thx.react.IObservable;
import precog.html.HtmlPanelGroup;
import precog.html.Icons;
import precog.geom.Rectangle;

class EditorModule extends Module {
    var current : Notebook;
    var notebooks : Array<Notebook>;
    var communicator : Communicator;
    var locale : Locale;
    var main : HtmlPanelGroup;
    var panels : Map<Notebook, HtmlPanelGroupItem>;

    public function new()
    {
        super();
        panels = new Map();
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
        communicator.on(function(e : EditorNotebookUpdate) changeNotebook(e.current));

        communicator.queueMany([
            new MenuItemMessage(new MenuItem(MenuEdit(SubgroupEditHistory), "Undo", function(_){}, 0)),
            new MenuItemMessage(new MenuItem(MenuEdit(SubgroupEditHistory), "Redo", function(_){}, 1))
        ]);
    }

    public function init(editorPanelMessage: MainEditorHtmlPanelMessage, locale : Locale) {
        this.locale = locale;

        QuirrelMode.init();

        // Global keyhandlers
        Reflect.setField(CodeMirror.keyMap.macDefault, "Shift-Enter", evaluateRegion);
        Reflect.setField(CodeMirror.keyMap.pcDefault, "Shift-Enter", evaluateRegion);
        Reflect.setField(CodeMirror.keyMap.macDefault, "Cmd-Enter", createRegion);
        Reflect.setField(CodeMirror.keyMap.pcDefault, "Ctrl-Enter", createRegion);

                // TODO: move out from here: TABS!!!
        var rect = new Rectangle();
        editorPanelMessage.value.rectangle.addListener(rect.updateSize);
        rect.updateSize(editorPanelMessage.value.rectangle);
        main = new HtmlPanelGroup(editorPanelMessage.value.element, rect, true);
        main.gutterMargin = 0;
        main.toggleSize = Default;
//        main.toggleType = Primary;
        main.gutterPosition = Top;
        main.events.activate.on(function(panel : HtmlPanelGroupItem) {
            if(null == panel)
                return;
            // silly way of getting back the clicked notebook
            for(notebook in notebooks)
            {
                if(panel != panels.get(notebook)) continue;
                communicator.trigger(new EditorNotebookUpdate(notebook, notebooks));
                break;
            }
        });

        createNotebook();
    }

    var counter : Int = 0;
    function createNotebook() 
    {
        var notebook = new Notebook(locale.format("notebook #{0}", [++counter])),
            item = new HtmlPanelGroupItem(notebook.name, Icons.book);
        main.addItem(item);
        panels.set(notebook, item);
        item.panel.element.addClass("edit-area");
        item.panel.element.append(notebook.element);
        notebooks.push(notebook);
        notebook.events.changeName.on(function(old : String, notebook : Notebook) {
            item.toggle.text = notebook.name;
        });
        communicator.trigger(new EditorNotebookUpdate(notebook, notebooks));
        communicator.trigger(new EditorRegionRequestCreate(new Region(QuirrelRegionMode, locale)));
   }

    function changeNotebook(notebook: Notebook) {
        current = notebook;
        if(null == current)
            return;
        panels.get(current).activate();
        current.show();
    }

    function closeNotebook() {
        if(null == current)
            return;
        var notebook = current;
        for(region in notebook)
            region.events.clear();
        notebooks.remove(notebook);
        var item = panels.get(notebook);
        panels.remove(notebook);
        notebook.events.clear();
        main.removeItem(item);
    }

    function deleteRegion(region: Region) {
        region.events.clear();
        current.deleteRegion(region);
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
