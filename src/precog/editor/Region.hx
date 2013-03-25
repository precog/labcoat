package precog.editor;

import precog.editor.codemirror.Externs;
import jQuery.JQuery;
import jQuery.Event;
import js.Browser.document;

class Region {
    public var mode: RegionMode;
    public var element: JQuery;
    public var editor: RegionEditor;

    var buttons: RegionButtons;

    function createEditor() {
        return switch(this.mode) {
        case QuirrelRegionMode: new QuirrelEditor(this);
        case MarkdownRegionMode: new MarkdownEditor(this);
        case JSONRegionMode: new JSONEditor(this);
        }
    }

    public function new(mode: RegionMode) {
        this.mode = mode;

        element = new JQuery('<div class="region"></div>');
        buttons = new RegionButtons(this);
        element.append(buttons.element);

        editor = createEditor();
        var content = new JQuery('<div class="content"></div>');
        content.append(editor.element);
        element.append(content);
    }
}
