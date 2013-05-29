package precog.editor;

import labcoat.message.PrecogRequest;
import labcoat.message.PrecogResponse;
import labcoat.message.RegionDrag;
import precog.communicator.Communicator;
import precog.editor.RegionModifier;
import precog.editor.codemirror.Externs;
import precog.html.HtmlDropdown;
import jQuery.JQuery;
import jQuery.Event;
import thx.react.Signal;
import precog.util.Locale;

using precog.editor.RegionMode;

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
        public var delete(default, null) : Signal1<Region>;
        public function clear() : Void;
    };

    var communicator: Communicator;
    var modifiers: RegionModifiers;
    var editorToolbar: JQuery;

    function changeTo(mode: RegionMode) {
        return function(event: Event) {
            events.changeMode.trigger(this, mode);
            return false;
        };
    }

    function changeEditorModeButton() {
        var items = [];

        Type.allEnums(RegionMode).map(function(other) {
            if(!Type.enumEq(mode, other))
                items.push(DropdownButton(locale.format('switch to {0}', [other.toEnglish()]), '', changeTo(other)));
        });

        var dropdown = new HtmlDropdown(locale.singular(mode.toEnglish()), '', '', Mini, items, DropdownAlignLeft);
        dropdown.element
            .addClass("region-type")
            .find("button:first-child").addClass("btn-link");
        return dropdown;
    }

    function createEditor() {
        return switch(mode) {
            case QuirrelRegionMode: new QuirrelEditor(communicator, this, editorToolbar);
            case MarkdownRegionMode: new MarkdownEditor(communicator, this);
            case JSONRegionMode: new JSONEditor(communicator, this);
            case VegaRegionMode: new VegaEditor(this);
            case PolychartCodeRegionMode: new PolychartCodeEditor(communicator, this);
        }
    }

    public function path() {
        return '${directory}/${filename}';
    }

    public function new(communicator: Communicator, directory: String, filename: String, mode: RegionMode, modifiers: RegionModifiers, locale : Locale) {
        this.events = {
            changeMode : new Signal2(),
            delete : new Signal1(),
            clear : function() {
                for(field in Reflect.fields(this)) {
                    var signal : Signal<Dynamic> = Reflect.field(this, field);
                    if(!Std.is(signal, Signal))
                        continue;
                    signal.clear();
                }
            }
        };

        this.communicator = communicator;
        this.directory = directory;
        this.filename = filename;
        this.mode = mode;
        this.modifiers = modifiers;
        this.locale = locale;

        element = new JQuery('<div class="region-container"></div>');

        var dropArea = new JQuery('<div class="drop-area"><i class="icon-arrow-left"></i><span class="text">${locale.singular("move here")}</span></div>');
        dropArea.bind('dragover', null, function(event: jQuery.Event) {
            event.preventDefault();
            var originalEvent = untyped event.originalEvent;
            originalEvent.dataTransfer.dropEffect = 'move';
            dropArea.addClass('over');
            return false;
        });
        dropArea.bind('dragleave', null, function(event: jQuery.Event) {
            event.preventDefault();
            dropArea.removeClass('over');
            return false;
        });
        dropArea.bind('drop', null, function(event: jQuery.Event) {
            event.preventDefault();
            dropArea.removeClass('over');

            communicator.trigger(new RegionDragTo(this));
        });

        var regionElement = new JQuery('<div class="region" draggable="true"></div>').appendTo(element);
        regionElement.bind('dragstart', null, function(event: Event) {
            dropArea.hide();
            haxe.Timer.delay(function() {
                communicator.trigger(new RegionDragStart());
            }, 0);
            var originalEvent = untyped event.originalEvent;
            originalEvent.dataTransfer.effectAllowed = 'move';
            originalEvent.dataTransfer.setData('Text', '/./${filename}');
        });
        regionElement.bind('dragend', null, function(event: Event) {
            event.preventDefault();
            dropArea.show();
            communicator.trigger(new RegionDragStop());

            var originalEvent = untyped event.originalEvent;
            if(originalEvent.dataTransfer.dropEffect == 'none') {
                // Cancelled
                return;
            }

            communicator.trigger(new RegionDrag(this));
        });

        var titlebar = new JQuery('<div class="titlebar"><i class="icon-ellipsis-vertical pull-left dragger"></i></div>');
        titlebar.append(changeEditorModeButton().element);
        editorToolbar = new JQuery('<div class="editor toolbar"></div>').appendTo(titlebar);

        var contextToolbar = new JQuery('<div class="context toolbar"></div>').appendTo(titlebar);


        var buttons = modifiers.toButtons(this, locale);
        for(button in buttons) {
            contextToolbar.append(button.element);
        }

        regionElement.append(titlebar);

        editor = createEditor();
        var content = new JQuery('<div class="content"></div>');
        content.append(editor.element);
        regionElement.append(content);

        dropArea.appendTo(element);

        communicator.request(
            new RequestFileGet(path()),
            ResponseFileGet
        ).then(thx.core.Procedure.ProcedureDef.fromArity1(function(response: ResponseFileGet) {
            // HACK: Precog API loves to send us back [] instead of 404
            if(response.content.contents == '[]' && mode != JSONRegionMode)
                return;

            editor.setContent(response.content.contents);
            editor.evaluate();
        }));
    }
}
