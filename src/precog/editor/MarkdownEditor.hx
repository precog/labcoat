package precog.editor;

import precog.editor.codemirror.Externs;
import precog.editor.markdown.Externs;
import js.Browser.document;
import js.html.Element;
import js.html.Event;
import js.html.Node;

using StringTools;

class MarkdownEditor implements RegionEditor {
    public var element: Element;
    var editor: CodeMirror;
    var region: Region;
    var rendered: Element;

    public function new(region: Region) {
        this.region = region;

        var options: Dynamic = {mode: 'markdown', region: region};

        rendered = document.createElement('div');
        rendered.style.display = 'none';
        // Giving block elements a tabIndex give them a "focus" event.
        rendered.tabIndex = -1;
        rendered.addEventListener('focus', renderedFocus, false);

        element = document.createElement('div');
        element.appendChild(rendered);

        editor = CodeMirrorFactory.addTo(element, options);
        editor.on('blur', editorBlur);
    }

    function renderedFocus(event: Event) {
        rendered.style.display = 'none';
        editor.getWrapperElement().style.display = 'block';
        focus();
    }

    function editorBlur(editor: CodeMirror) {
        // Don't remove the editor if the content is empty (would
        // result in an empty, non-clickable div)
        if(getContent().trim().length == 0) return;

        editor.getWrapperElement().style.display = 'none';
        rendered.style.display = 'block';
        rendered.innerHTML = Markdown.toHTML(getContent());
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
        editor.refresh();
        editor.focus();
    }
}
