package precog.editor;

import precog.editor.codemirror.Externs;
import jQuery.JQuery;
import jQuery.Event;
import js.Browser.document;
import thx.react.Signal;
import precog.util.Locale;

class Region {
    public var mode: RegionMode;
    public var element: JQuery;
    public var editor: RegionEditor;
    public var events(default, null) : {
        public var changeMode(default, null) : Signal2<Region, RegionMode>;
        public var remove(default, null) : Signal1<Region>;
    };

    var buttons: RegionButtons;

    function createEditor() {
        return switch(this.mode) {
        case QuirrelRegionMode: new QuirrelEditor(this);
        case MarkdownRegionMode: new MarkdownEditor(this);
        case JSONRegionMode: new JSONEditor(this);
        }
    }

    public function new(mode: RegionMode, locale : Locale) {
        this.events = {
            changeMode : new Signal2(),
            remove : new Signal1()
        };

        this.mode = mode;

        element = new JQuery('<div class="region"></div>');
        buttons = new RegionButtons(this, locale);
        element.append(buttons.element);

        editor = createEditor();
        var content = new JQuery('<div class="content"></div>');
        content.append(editor.element);
        element.append(content);
    }
}
