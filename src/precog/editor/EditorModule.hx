package precog.editor;

import precog.app.message.HtmlMainPanelMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.editor.codemirror.Externs;
import precog.editor.codemirror.QuirrelMode;
import js.Browser.document;
import js.JQuery;
import js.html.Element;
import js.html.Node;

class EditorModule extends Module {
    public static var element = new JQuery('<div class="editor"><div class="toolbar"></div></div>');
    static var toolbar = new Toolbar(element.find('.toolbar'));

    override public function connect(communicator: Communicator) {
        communicator.demand(HtmlMainPanelMessage).then(init);
    }

    override public function disconnect(communicator: Communicator) {
        element.remove();
    }

    public function init(mainPanelMessage: HtmlMainPanelMessage) {
        mainPanelMessage.value.element.append(element);

        QuirrelMode.init();

        // Place first at end of document body
        appendRegion(new Region(QuirrelRegionMode));

        // Global keyhandlers
        Reflect.setField(CodeMirror.keyMap.macDefault, "Shift-Enter", evaluateRegion);
        Reflect.setField(CodeMirror.keyMap.pcDefault, "Shift-Enter", evaluateRegion);
        Reflect.setField(CodeMirror.keyMap.macDefault, "Cmd-Enter", insertRegion);
        Reflect.setField(CodeMirror.keyMap.pcDefault, "Ctrl-Enter", insertRegion);
    }

    static function deleteRegion(region: Region) {
        region.element.remove();
    }

    public static function deleteRegionEnsureNonEmpty(region: Region) {
        //if(parentElement.childElementCount <= 1) return;
        deleteRegion(region);
    }

    public static function changeRegionMode(oldRegion: Region, mode: RegionMode) {
        var content = oldRegion.editor.getContent();
        var region = new Region(mode);
        region.editor.setContent(content);
        appendRegion(region, oldRegion.element);

        deleteRegion(oldRegion);
    }

    static function appendRegion(region: Region, ?target: JQuery) {
        if(target != null) {
            target.after(region.element);
        } else {
            element.append(region.element);
        }
        region.editor.focus();
    }

    static function insertRegion(editor: CodeMirror) {
        var region: Region = editor.getOption('region');
        appendRegion(new Region(region.mode), region.element);
    }

    static function evaluateRegion(editor: CodeMirror) {
        var region: Region = editor.getOption('region');
        region.editor.evaluate();
    }
}
