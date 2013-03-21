package precog.editor;

import precog.editor.RegionMode;
import js.Browser.document;
import js.JQuery;
import js.html.Element;
import js.html.Event;
import js.html.OptionElement;
import js.html.SelectElement;

class Toolbar {
    public static function element(region: Region) {
        var element = new JQuery('<div class="toolbar"><select class="mode-select"><option class="quirrel" value="quirrel">Quirrel</option><option class="markdown" value="markdown">Markdown</option><option class="json" value="json">JSON</option></select> <button class="delete btn">&#x2716;</button></div>').hide();

        switch(region.mode) {
        case QuirrelRegionMode: element.find('option.quirrel').attr('selected', 'selected');
        case MarkdownRegionMode: element.find('option.markdown').attr('selected', 'selected');
        case JSONRegionMode: element.find('option.json').attr('selected', 'selected');
        }

        var mode = element.find('.mode-select');
        function modeChange(event: JqEvent) {
            Editor.changeRegionMode(region, valueToEditorMode(mode.val()));
        }
        mode.change(modeChange);

        var delete = element.find('.delete.btn');
        function deleteRegion(event: JqEvent) {
            Editor.deleteRegionEnsureNonEmpty(region);
        }
        delete.click(deleteRegion);

        return element;
    }

    public static function valueToEditorMode(value: String) {
        return switch(value) {
        case 'quirrel': QuirrelRegionMode;
        case 'markdown': MarkdownRegionMode;
        case 'json': JSONRegionMode;
        case _: throw "Unknown region mode";
        }
    }
}
