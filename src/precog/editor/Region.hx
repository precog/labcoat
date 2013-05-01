package precog.editor;

import precog.communicator.Communicator;
import precog.editor.codemirror.Externs;
import jQuery.JQuery;
import jQuery.Event;
import js.Browser.document;
import thx.react.Signal;
import precog.util.Locale;

class Region {
    public var index: Int;
    public var path: String;

    public var mode: RegionMode;
    public var element: JQuery;
    public var editor: RegionEditor;
    public var events(default, null) : {
        public var changeMode(default, null) : Signal2<Region, RegionMode>;
        public var remove(default, null) : Signal1<Region>;
        public function clear() : Void;
    };

    var buttons: RegionButtons;
    var communicator: Communicator;

    function createEditor() {
        return switch(this.mode) {
            case QuirrelRegionMode: new QuirrelEditor(communicator, this);
            case MarkdownRegionMode: new MarkdownEditor(this);
            case JSONRegionMode: new JSONEditor(this);
            case VegaRegionMode: new VegaEditor(this);
        }
    }

    public function new(communicator: Communicator, path: String, mode: RegionMode, locale : Locale) {
        this.events = {
            changeMode : new Signal2(),
            remove : new Signal1(),
            clear : function() {
                for(field in Reflect.fields(this)) {
                    var signal : Signal<Dynamic> = Reflect.field(this, field);
                    if(!Std.is(signal, Signal))
                        continue;
                    signal.clear();
                }
            }
        };

        this.mode = mode;
        this.communicator = communicator;
        this.path = path;

        element = new JQuery('<div class="region"></div>');
        buttons = new RegionButtons(this, locale);
        element.append(buttons.element);

        editor = createEditor();
        var content = new JQuery('<div class="content"></div>');
        content.append(editor.element);
        element.append(content);
    }
}
