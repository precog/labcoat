package precog.editor.markdown;

enum MarkdownContentTag {
    MarkdownP;
    MarkdownA;
    MarkdownUL;
    MarkdownLI;
    MarkdownH1;
    MarkdownH2;
}

enum MarkdownEmptyTag {
    MarkdownIMG;
}

enum MarkdownNode {
    MarkdownContentElement(tag: MarkdownContentTag, content: Array<MarkdownNode>, attributes: Map<String, String>);
    MarkdownEmptyElement(tag: MarkdownEmptyTag, attributes: Map<String, String>);
    MarkdownText(text: String);
}

class Renderer {
    public static function render(ast: Array<MarkdownNode>) {
        return ast.map(renderNode).join('\n');
    }

    static function renderNode(node: MarkdownNode) {
        return switch(node) {
        case MarkdownContentElement(tag, content, attributes):
            var tagName = contentTagString(tag);
            var inner = content.map(renderNode).join('\n');
            '<${tagName}${attributesString(attributes)}>${inner}</${tagName}>';
        case MarkdownEmptyElement(tag, attributes):
            var tagName = emptyTagString(tag);
            '<${tagName}${attributesString(attributes)} />';
        case MarkdownText(text):
            '${text}';
        };
    }

    static function attributesString(attributes: Map<String, String>) {
        var accum = '';
        for(key in attributes.keys()) {
            accum += ' ${key}="${attributes.get(key)}"';
        }
        return accum;
    }

    static function contentTagString(tag: MarkdownContentTag) {
        return switch(tag) {
        case MarkdownP: 'p';
        case MarkdownA: 'a';
        case MarkdownUL: 'ul';
        case MarkdownLI: 'li';
        case MarkdownH1: 'h1';
        case MarkdownH2: 'h2';
        }
    }

    static function emptyTagString(tag: MarkdownEmptyTag) {
        return switch(tag) {
        case MarkdownIMG: 'img';
        }
    }
}
