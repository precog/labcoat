package precog.editor;

import precog.editor.RegionMode;
import js.Browser.document;
import js.JQuery;
import js.html.Element;
import js.html.Event;
import js.html.OptionElement;
import js.html.SelectElement;

class RegionButtons {
    public var element: JQuery;
    var region: Region;

    public function new(region: Region) {
        this.region = region;

        element = new JQuery('<div class="buttons"></div>');

        if(region.mode != QuirrelRegionMode) {
            new JQuery('<button class="quirrel btn btn-mini">Q</button></div>').appendTo(element).click(changeTo(QuirrelRegionMode));
        }
        if(region.mode != MarkdownRegionMode) {
            new JQuery('<button class="markdown btn btn-mini">M</button></div>').appendTo(element).click(changeTo(MarkdownRegionMode));
        }
        if(region.mode != JSONRegionMode) {
            new JQuery('<button class="json btn btn-mini">J</button></div>').appendTo(element).click(changeTo(JSONRegionMode));
        }

        new JQuery('<button class="move-up btn btn-mini icon-caret-up"></button></div>').appendTo(element);
        new JQuery('<button class="move-down btn btn-mini icon-caret-down"></button></div>').appendTo(element);
        new JQuery('<button class="delete btn btn-mini icon-trash"></button></div>').appendTo(element);
    }

    function changeTo(mode: RegionMode) {
        return function(event: JqEvent) {
            EditorModule.changeRegionMode(region, mode);
        };
    }

    public function show() {
        element.addClass('visible');
    }

    public function hide() {
        element.removeClass('visible');
    }
}
