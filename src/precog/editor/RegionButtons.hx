package precog.editor;

import precog.editor.RegionMode;
import jQuery.JQuery;
import jQuery.Event;
import precog.html.Bootstrap;
import js.Browser.document;

class RegionButtons {
    public var element: JQuery;
    var region: Region;

    public function new(region: Region) {
        this.region = region;

        element = new JQuery('<div class="buttons dropdown"></div>');

        new JQuery('<button class="quirrel btn btn-mini icon-cog" class="dropdown-toggle" data-toggle="dropdown"></button></div>').appendTo(element);
        var menu = new JQuery('<ul class="dropdown-menu pull-right" role="menu" aria-labelledby="dropdownMenu"></ul>').appendTo(element);

        if(region.mode != QuirrelRegionMode) {
            new JQuery('<li><a tabindex="-1" href="#">Switch to Quirrel</a></li>').appendTo(menu).click(changeTo(QuirrelRegionMode));
        }
        if(region.mode != MarkdownRegionMode) {
            new JQuery('<li><a tabindex="-1" href="#">Switch to Markdown</a></li>').appendTo(menu).click(changeTo(MarkdownRegionMode));
        }
        if(region.mode != JSONRegionMode) {
            new JQuery('<li><a tabindex="-1" href="#">Switch to JSON</a></li>').appendTo(menu).click(changeTo(JSONRegionMode));
        }

        // TODO: box-sizing ruins the divider
        new JQuery('<li class="divider"></li>').appendTo(menu);

        /*
        new JQuery('<button class="move-up btn btn-mini icon-caret-up"></button></div>').appendTo(element);
        new JQuery('<button class="move-down btn btn-mini icon-caret-down"></button></div>').appendTo(element);
        */
        new JQuery('<li><a tabindex="-1" href="#">Delete</a></li>').appendTo(menu).click(deleteRegion);
    }

    function changeTo(mode: RegionMode) {
        return function(event: Event) {
            EditorModule.changeRegionMode(region, mode);
            return false;
        };
    }

    function deleteRegion(event: Event) {
        EditorModule.deleteRegionEnsureNonEmpty(region);
        return false;
    }
}
