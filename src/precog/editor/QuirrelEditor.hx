package precog.editor;

import labcoat.message.PrecogRequest;
import labcoat.message.PrecogResponse;
import labcoat.message.StatusMessage;
import precog.communicator.Communicator;
import precog.editor.codemirror.Externs;
import precog.html.HtmlButton;
import precog.html.Icons;
import jQuery.JQuery;
import thx.core.Procedure;

class QuirrelEditor implements RegionEditor {
    public var element: JQuery;
    var outputElement: JQuery;
    var region: Region;
    var communicator: Communicator;
    var editor: CodeMirror;
    var showHideButton: HtmlButton;

    public function new(communicator: Communicator, region: Region, editorToolbar: JQuery) {
        this.region = region;
        this.communicator = communicator;

        var options: Dynamic = {lineNumbers: true, mode: 'quirrel', region: region, lineWrapping : true };

        element = new JQuery('<div></div>');

        var editorElement = new JQuery('<div class="editor trimmed"></div>').appendTo(element);
        editor = CodeMirrorFactory.addTo(editorElement.get(0), options);

        var runButton = new HtmlButton('run', Icons.play, Mini);
        runButton.type = Flat;
        runButton.element.click(onclick);
        editorToolbar.append(runButton.element);

        var outputbar = new JQuery('<div class="outputbar"></div>').appendTo(element);

        outputbar.append('<div class="buttons dropdown region-type"><button class="btn btn-mini btn-link">JSON</button></div></div>');

        var contextToolbar = new JQuery('<div class="context toolbar"></div>').appendTo(outputbar);
        showHideButton = new HtmlButton('', Icons.eyeClose, Mini, true);
        showHideButton.type = Flat;
        showHideButton.element.click(showHideOutput);
        showHideButton.element.addClass('show-hide');
        contextToolbar.append(showHideButton.element);

        outputElement = new JQuery('<div class="output"></div>').appendTo(element);
    }

    function showHideOutput(_) {
        showHideButton.leftIcon = element.find('.output').toggle().is(':visible') ? Icons.eyeClose : Icons.eyeOpen;
    }

    public function getContent() {
        return editor.getValue();
    }

    public function setContent(content: String) {
        editor.setValue(content);
    }

    function onclick(_ : jQuery.Event) {
        evaluate();
    }

    public function evaluate() {
        communicator.request(
            new RequestFileGet(region.path()),
            ResponseFileGet
        ).then(function(response: ResponseFileGet) {
            var changed = getContent() != response.content.contents;

            if(!changed)
                return requestExecute();

            return communicator.request(
                new RequestFileUpload(region.path(), "text/x-quirrel-script", editor.getValue()),
                ResponseFileUpload
            ).then(thx.core.Procedure.ProcedureDef.fromArity1(function(response: ResponseFileUpload) {
                return requestExecute();
            }));
        });
    }

    function requestExecute(): thx.react.Promise<Dynamic> {
        return communicator.request(
            new RequestFileExecute(region.path()),
            ResponseFileExecute
        ).then(ProcedureDef.fromArity1(function(res: ResponseFileExecute) {
            outputElement.html('<div class="out">${region.filename} :=</div><div class="data">${haxe.Json.stringify(res.result)}</div><ul class="errors"></ul><ul class="warnings"></ul>');

            var errorsElement = outputElement.find('.errors');
            var warningsElement = outputElement.find('.warnings');

            // Cached file execute doesn't give a report...
            /*var errors = res.result.errors.map(function(e) return e.message).concat(res.result.serverErrors),
                warnings = res.result.warnings.map(function(w) return w.message).concat(res.result.serverWarnings);

            for(warning in warnings) {
                warningsElement.append('<li><i class="icon-warning-sign"></i> ${warning}</li>');
                communicator.queue(new StatusMessage(warning, Warning));
            }

            for(error in errors) {
                errorsElement.append('<li><i class="icon-exclamation-sign"></i> ${error}</li>');
                communicator.queue(new StatusMessage(error, Error));
            }*/
        }));
    }

    public function focus() {
        editor.refresh();
        editor.focus();
    }
}
