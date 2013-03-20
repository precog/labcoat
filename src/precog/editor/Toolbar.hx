package precog.editor;

import precog.editor.RegionMode;
import js.Browser.document;
import js.html.Element;
import js.html.Event;
import js.html.OptionElement;
import js.html.SelectElement;

class Toolbar {
    public static function element(region: Region) {
        var element = document.createElement('div');
        element.className = 'toolbar';
        element.style.display = 'none';

        {
            var mode: SelectElement = untyped document.createElement('select');
            function change(event: Event) {
                Main.changeRegionMode(region, valueToEditorMode(mode.value));
            }
            mode.addEventListener('change', change, false);

            {
                var quirrelOption: OptionElement = untyped document.createElement('option');
                quirrelOption.label = 'Quirrel';
                quirrelOption.value = 'quirrel';
                quirrelOption.selected = region.mode == QuirrelRegionMode;
                mode.appendChild(quirrelOption);
            }

            {
                var markdownOption: OptionElement = untyped document.createElement('option');
                markdownOption.label = 'Markdown';
                markdownOption.value = 'markdown';
                markdownOption.selected = region.mode == MarkdownRegionMode;
                mode.appendChild(markdownOption);
            }

            {
                var jsonOption: OptionElement = untyped document.createElement('option');
                jsonOption.label = 'JSON';
                jsonOption.value = 'json';
                jsonOption.selected = region.mode == JSONRegionMode;
                mode.appendChild(jsonOption);
            }

            element.appendChild(mode);
        }

        {
            var delete = document.createElement('button');
            function deleteRegion(event: Event) {
                Main.deleteRegionEnsureNonEmpty(region);
            }
            delete.addEventListener('click', deleteRegion, false);
            delete.className = 'delete';
            delete.innerHTML = '&#x2716;';
            element.appendChild(delete);
        }

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
