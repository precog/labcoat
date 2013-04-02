package precog.editor;

import precog.editor.RegionMode;
import precog.html.HtmlDropdown;
import jQuery.JQuery;
import jQuery.Event;
import js.Browser.document;

class RegionButtons {
    public var element: JQuery;
    var region: Region;

    public function new(region: Region) {
        this.region = region;

        var items = [];

        if(region.mode != QuirrelRegionMode) {
            items.push(DropdownButton('Switch to Quirrel', '', changeTo(QuirrelRegionMode)));
        }
        if(region.mode != MarkdownRegionMode) {
            items.push(DropdownButton('Switch to Markdown', '', changeTo(MarkdownRegionMode)));
        }
        if(region.mode != JSONRegionMode) {
            items.push(DropdownButton('Switch to JSON', '', changeTo(JSONRegionMode)));
        }

        items = items.concat([
            DropdownDivider,
            DropdownButton('Delete', '', deleteRegion)
        ]);

        element = new HtmlDropdown('', 'cog', Mini, items, DropdownAlignRight).element;
    }

    function changeTo(mode: RegionMode) {
        return function(event: Event) {
trace("changeTo");
            region.events.changeMode.trigger(region, mode);
            return false;
        };
    }

    function deleteRegion(event: Event) {
trace("delete");
        region.events.remove.trigger(region);
        return false;
    }
}