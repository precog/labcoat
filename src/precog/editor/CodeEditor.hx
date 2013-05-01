package precog.editor;

import precog.communicator.Communicator;
import precog.editor.Editor;
import jQuery.JQuery;

class CodeEditor implements Editor {
    @:isVar public var name(get, set): String;
    var region: Region;

    public var element(default, null): JQuery;

    public function new(communicator: Communicator, name: String, locale: precog.util.Locale) {
        element = new JQuery('<div class="code-editor"></div>');
        region = new Region(communicator, name, MarkdownRegionMode, locale);
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
