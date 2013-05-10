package precog.editor;

import precog.app.message.PrecogRequest;
import precog.app.message.PrecogResponse;
import precog.communicator.Communicator;
import precog.editor.codemirror.Externs;
import precog.html.HtmlButton;
import precog.html.HtmlDropdown;
import jQuery.JQuery;
import jQuery.Event;
import js.Browser.document;
import thx.react.Signal;
import precog.util.Locale;

class Region {
    public var index: Int;
    public var directory: String;
    public var filename: String;
    public var locale: Locale;

    public var mode: RegionMode;
    public var element: JQuery;
    public var editor: RegionEditor;
    public var events(default, null) : {
        public var changeMode(default, null) : Signal2<Region, RegionMode>;
        public var remove(default, null) : Signal1<Region>;
        public function clear() : Void;
    };

    var communicator: Communicator;
    var editorToolbar: JQuery;

    // TOOD: Triggering ourselves
    function changeTo(mode: RegionMode) {
        return function(event: Event) {
            events.changeMode.trigger(this, mode);
            return false;
        };
    }

    function changeEditorModeButton() {
        var items = [];

        if(mode != QuirrelRegionMode) {
            items.push(DropdownButton(locale.format('switch to {0}', ['Quirrel']), '', changeTo(QuirrelRegionMode)));
        }
        if(mode != MarkdownRegionMode) {
            items.push(DropdownButton(locale.format('switch to {0}', ['Markdown']), '', changeTo(MarkdownRegionMode)));
        }
        if(mode != JSONRegionMode) {
            items.push(DropdownButton(locale.format('switch to {0}', ['JSON']), '', changeTo(JSONRegionMode)));
        }
        if(mode != VegaRegionMode) {
            items.push(DropdownButton(locale.format('switch to {0}', ['Vega']), '', changeTo(VegaRegionMode)));
        }

        return new HtmlDropdown(mode+'', '', '', Mini, items, DropdownAlignLeft);
    }

    function createEditor() {
        return switch(mode) {
            case QuirrelRegionMode: new QuirrelEditor(communicator, this, editorToolbar);
            case MarkdownRegionMode: new MarkdownEditor(communicator, this);
            case JSONRegionMode: new JSONEditor(communicator, this);
            case VegaRegionMode: new VegaEditor(this);
        }
    }

    public function path() {
        return '${directory}/${filename}';
    }

    public function new(communicator: Communicator, directory: String, filename: String, mode: RegionMode, locale : Locale) {
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
        this.directory = directory;
        this.filename = filename;
        this.locale = locale;

        element = new JQuery('<div class="region"></div>');

        var titlebar = new JQuery('<div class="titlebar"></div>');
        titlebar.append(changeEditorModeButton().element);
        editorToolbar = new JQuery('<div class="editor toolbar"></div>').appendTo(titlebar);
        titlebar.append('<div class="context toolbar"></div>');
        element.append(titlebar);

        editor = createEditor();
        var content = new JQuery('<div class="content"></div>');
        content.append(editor.element);
        element.append(content);

        communicator.request(
            new RequestFileGet(path()),
            ResponseFileGet
        ).then(function(response: ResponseFileGet) {
            // HACK: Precog API loves to send us back [] instead of 404
            if(response.content.contents == '[]' && mode != JSONRegionMode)
                return;

            editor.setContent(response.content.contents);
            editor.evaluate();
        });
    }
}
