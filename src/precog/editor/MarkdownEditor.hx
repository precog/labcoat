package precog.editor;

import jQuery.Event;
import jQuery.JQuery;
import js.html.Node;
import labcoat.message.PrecogRequest;
import labcoat.message.PrecogResponse;
import precog.communicator.Communicator;
import precog.editor.codemirror.Externs;
import precog.editor.markdown.Externs;
import precog.editor.mathjax.MathJax;

using StringTools;
using precog.editor.markdown.JsonML;

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

        element = new JQuery('<div class="editor trimmed"></div>').append(rendered);

        editor = CodeMirrorFactory.addTo(element.get(0), options);
        editor.on('blur', editorBlur);
        editor.getWrapperElement().className += ' markdown-editor';
    }

    function editorBlur(editor: CodeMirror) {
        // Don't remove the editor if the content is empty (would
        // result in an empty, non-clickable div)
        if(getContent().trim().length == 0) return;

        var parseTree = JsonML.toTree(Markdown.toHTMLTree(getContent()));
        var mathRE = ~/^maths?\n/m;
        var tree = parseTree.transform(function(t: JsonMLTree) {
            return switch(t) {
            // Math blocks
            case JsonMLNode('p', _, [JsonMLNode('code', _, [JsonMLText(s)])]) if(mathRE.match(s)):
                var attrs = new Map();
                attrs['class'] = 'mathjax';
                var math = mathRE.replace(s, '');
                JsonMLNode('div', attrs, [JsonMLText(math)]);

            // Fenced code blocks
            case JsonMLNode('p', a1, [JsonMLNode('code', a2, code)]):
                JsonMLNode('pre', a1, [JsonMLNode('code', a2, code)]);

            default:
                t;
            }
        });

        editor.getWrapperElement().style.display = 'none';
        rendered.show().html(Markdown.renderJsonML(tree.fromTree()));

        rendered.find('.mathjax').each(function(index: Int, element: Node) {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, element]);
        });

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
