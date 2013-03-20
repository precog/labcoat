package precog.editor;

import precog.editor.codemirror.Externs;
import precog.editor.codemirror.QuirrelMode;
import js.Browser.document;
import js.html.Element;
import js.html.Node;

class Main {
    static function main() {
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
        document.body.removeChild(region.element);
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

    static function appendRegion(region: Region, ?target: Node) {
        if(target == null || target.nextSibling == null) {
            document.body.appendChild(region.element);
        } else {
            document.body.insertBefore(region.element, target.nextSibling);
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
