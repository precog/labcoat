package precog.editor;

import precog.editor.RegionMode;
import js.Browser.document;
import js.JQuery;
import js.html.Element;
import js.html.Event;
import js.html.OptionElement;
import js.html.SelectElement;

class Toolbar {
    var select: JQuery;

    public function new(element: JQuery) {
        select = new JQuery('<select class="mode-select"></select>').appendTo(element);

        makeOption('Quirrel', 'quirrel').appendTo(select);
        makeOption('Markdown', 'markdown').appendTo(select);
        makeOption('JSON', 'json').appendTo(select);

        new JQuery('<button class="delete btn">&#x2716;</button></div>').appendTo(element);
    }

    public function selectMode(mode: RegionMode) {
        select.val(switch(mode) {
            case QuirrelRegionMode: 'quirrel';
            case MarkdownRegionMode: 'markdown';
            case JSONRegionMode: 'json';
        });
    }

    static function makeOption(label: String, value: String) {
        return new JQuery('<option class="$value" value="$value">$label</option>');
    }
}
