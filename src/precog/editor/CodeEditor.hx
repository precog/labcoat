package precog.editor;

import precog.app.message.PrecogRequest;
import precog.app.message.PrecogResponse;
import precog.communicator.Communicator;
import precog.editor.Editor;
import jQuery.JQuery;

class CodeEditor implements Editor {
    public var element(default, null): JQuery;
    var region: Region;
    var communicator: Communicator;
    public var path(default, null): String;

    public function new(communicator: Communicator, path: String, mode: RegionMode, locale: precog.util.Locale) {
        element = new JQuery('<div class="code-editor"></div>');

        var segments = path.split('/');
        var filename = segments.pop();
        var directory = segments.join('/');

        // TODO: Allow files which are not Markdown
        region = new Region(communicator, directory, filename, mode, locale);
        element.append(region.element);
        this.communicator = communicator;
        this.path = path;
    }

    public function save(dest: String) {
        communicator.request(
            new RequestFileMove(path, dest),
            ResponseFileMove
        ).then(function(response: ResponseFileMove) {
            path = dest;
        });
    }

    public function show() {
        region.editor.focus();
    }
    public function clear() {}
}
