package precog.editor;

import precog.communicator.Communicator;
import precog.editor.Editor;
import jQuery.JQuery;

class CodeEditor implements Editor {
    public var path(default, null): String;
    var region: Region;

    public var element(default, null): JQuery;

    public function new(communicator: Communicator, path: String, locale: precog.util.Locale) {
        element = new JQuery('<div class="code-editor"></div>');
        region = new Region(communicator, path, MarkdownRegionMode, locale);
        element.append(region.element);
        this.path = path;
    }

    public function save(dest: String) {}

    public function show() {
        region.editor.focus();
    }
    public function clear() {}
}
