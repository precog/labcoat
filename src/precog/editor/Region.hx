package precog.editor;

import precog.editor.codemirror.Externs;
import js.Browser.document;
import js.JQuery;
import js.html.Event;

class Region {
    public var mode: RegionMode;

    public var element: JQuery;
    public var editor: RegionEditor;
    var toolbarElement: JQuery;

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

        toolbarElement = Toolbar.element(this);
        element.append(toolbarElement);

        editor = editorForMode(mode, this);
        element.append(editor.element);

        element.hover(mouseOver, mouseOut);
    }

    function mouseOver(event: JqEvent) {
        element.addClass('hover');
        toolbarElement.show();
    }

    function mouseOut(event: JqEvent) {
        element.removeClass('hover');
        toolbarElement.hide();
    }
}
