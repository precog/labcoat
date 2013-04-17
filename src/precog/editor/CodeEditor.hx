package precog.editor;

import jQuery.JQuery;
import precog.editor.Editor;

class CodeEditor implements Editor {
    @:isVar public var name(get, set): String;
    var region: Region;

    public var element(default, null): JQuery;

    public function new(name: String, locale: precog.util.Locale) {
        element = new JQuery('<div class="code-editor"></div>');
        region = new Region(MarkdownRegionMode, locale);
        element.append(region.element);
        this.name = name;
    }

    function get_name()
        return name;

    function set_name(value : String) {
        name = value;
        return value;
    }

    public function show() {
        region.editor.focus();
    }
    public function clear() {}
}
