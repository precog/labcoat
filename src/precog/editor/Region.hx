package precog.editor;

import precog.editor.codemirror.Externs;
import js.Browser.document;
import js.JQuery;
import js.html.Event;

class Region {
    public var mode: RegionMode;

    public var element: JQuery;
    public var editor: RegionEditor;

    static function editorForMode(mode: RegionMode, region: Region) {
        return switch(mode) {
        case QuirrelRegionMode: new QuirrelEditor(region);
        case MarkdownRegionMode: new MarkdownEditor(region);
        case JSONRegionMode: new JSONEditor(region);
        }
    }

    public function new(mode: RegionMode) {
        this.mode = mode;

        element = new JQuery('<div class="region"></div>');

        editor = editorForMode(mode, this);
        element.append(editor.element);
    }
}
