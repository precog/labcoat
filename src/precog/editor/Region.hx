package precog.editor;

import precog.editor.codemirror.Externs;
import js.Browser.document;
import js.JQuery;
import js.html.Event;

class Region {
    public var mode: RegionMode;
    public var element: JQuery;
    public var editor: RegionEditor;

    var buttons: RegionButtons;
    var hovered: Bool = false;
    var focused: Bool = true;

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
        element.hover(mouseOver, mouseOut);
        buttons = new RegionButtons(this);
        element.append(buttons.element);

        editor = createEditor();
        var content = new JQuery('<div class="content"></div>');
        content.append(editor.element);
        element.append(content);

        updateButtons();
    }

    public function setFocused(state: Bool) {
        focused = state;
        updateButtons();
    }

    function mouseOver(event: JqEvent) {
        hovered = true;
        updateButtons();
    }

    function mouseOut(event: JqEvent) {
        hovered = false;
        updateButtons();
    }

    function updateButtons() {
        if(focused || hovered) {
            buttons.show();
            return;
        }
        buttons.hide();
    }
}
