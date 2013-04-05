package precog.editor;

import precog.editor.RegionMode;
import precog.html.HtmlDropdown;
import jQuery.JQuery;
import jQuery.Event;
import js.Browser.document;
import precog.util.Locale;

class RegionButtons {
    public var element: JQuery;
    var region: Region;

    public function new(region: Region, locale : Locale) {
        this.region = region;

        var items = [];

        if(region.mode != QuirrelRegionMode) {
            items.push(DropdownButton(locale.format('switch to {0}', ['Quirrel']), '', changeTo(QuirrelRegionMode)));
        }
        if(region.mode != MarkdownRegionMode) {
            items.push(DropdownButton(locale.format('switch to {0}', ['Markdown']), '', changeTo(MarkdownRegionMode)));
        }
        if(region.mode != JSONRegionMode) {
            items.push(DropdownButton(locale.format('switch to {0}', ['JSON']), '', changeTo(JSONRegionMode)));
        }

        items = items.concat([
            DropdownDivider,
            DropdownButton(locale.singular('delete'), '', deleteRegion)
        ]);

        element = new HtmlDropdown('', 'cog', '', Mini, items, DropdownAlignRight).element;
    }

    function changeTo(mode: RegionMode) {
        return function(event: Event) {
            region.events.changeMode.trigger(region, mode);
            return false;
        };
    }

    function deleteRegion(event: Event) {
        region.events.remove.trigger(region);
        return false;
    }
}