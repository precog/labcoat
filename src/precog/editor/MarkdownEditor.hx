package precog.editor;

import labcoat.message.PrecogRequest;
import labcoat.message.PrecogResponse;
import precog.communicator.Communicator;
import precog.editor.codemirror.Externs;
import precog.editor.markdown.Externs;
import jQuery.JQuery;
import jQuery.Event;

using StringTools;

class MarkdownEditor implements RegionEditor {
    public var element: JQuery;
    var communicator: Communicator;
    var editor: CodeMirror;
    var region: Region;
    var rendered: JQuery;

    public function new(communicator: Communicator, region: Region) {
        this.communicator = communicator;
        this.region = region;

        var options: Dynamic = {mode: 'markdown', region: region};

        rendered = new JQuery('<div class="markdown-rendered"></div>').hide();
        // Giving block elements a tabIndex give them a "focus" event.
        rendered.attr('tabindex', '-1');
        rendered.focus(function(e: Event) focus());

        element = new JQuery('<div class="editor"></div>').append(rendered);

        editor = CodeMirrorFactory.addTo(element.get(0), options);
        editor.on('blur', editorBlur);
        editor.getWrapperElement().className += ' markdown-editor';
    }

    function editorBlur(editor: CodeMirror) {
        // Don't remove the editor if the content is empty (would
        // result in an empty, non-clickable div)
        if(getContent().trim().length == 0) return;

        editor.getWrapperElement().style.display = 'none';
        rendered.show().html(Markdown.toHTML(getContent()));

        communicator.request(
            new RequestFileUpload(region.path(), "text/x-markdown", getContent()),
            ResponseFileUpload
        );
    }

    public function getContent() {
        return editor.getValue();
    }

    public function setContent(content: String) {
        return editor.setValue(content);
    }

    public function evaluate() {
        editorBlur(editor);
    }

    public function focus() {
        rendered.hide();
        editor.getWrapperElement().style.display = 'block';
        editor.refresh();
        editor.focus();
    }
}
