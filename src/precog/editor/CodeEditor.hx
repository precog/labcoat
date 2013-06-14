package precog.editor;

import labcoat.message.EditorSave;
import labcoat.message.PrecogRequest;
import labcoat.message.PrecogResponse;
import precog.communicator.Communicator;
import precog.editor.Editor;
import precog.editor.RegionModifier;
import jQuery.JQuery;

class CodeEditor implements Editor {
    static var modifiers = new RegionModifiers([]);

    public var element(default, null): JQuery;
    var region: Region;
    var communicator: Communicator;
    public var path(default, null): String;

    public function new(communicator: Communicator, path: String, mode: RegionMode, locale: precog.util.Locale) {
        element = new JQuery('<div class="code-editor"></div>');

        var segments = path.split('/');
        var filename = segments.pop();
        var directory = segments.join('/');

        region = new Region(this, communicator, directory, filename, mode, modifiers, locale);
        element.append(region.element);
        this.communicator = communicator;
        this.path = path;
    }

    public function save(dest: String) {
        communicator.trigger(new EditorSave(path, dest));
        communicator.request(
            new RequestFileCopy(path, dest),
            ResponseFileCopy
        ).then(thx.core.Procedure.ProcedureDef.fromArity1(function(response: ResponseFileCopy) {
            path = dest;
        }));
    }

    public function show() {
        region.editor.focus();
    }
    public function clear() {}
}
