package precog.editor.markdown;

import precog.editor.markdown.Externs;

enum JsonMLTree {
    JsonMLNode(tagName: String, attributes: Map<String, String>, elements: Array<JsonMLTree>);
    JsonMLText(text: String);
}

class JsonML {
    // Convert to typed representation
    public static function toTree(jsonML: Dynamic): JsonMLTree {
        if(Type.enumEq(Type.typeof(jsonML), TClass(String)))
            return JsonMLText(jsonML);

        var restIndex = 1;

        var attributes = new Map();
        if(Type.enumEq(Type.typeof(jsonML[1]), TObject)) {
            restIndex = 2;

            var fields = Reflect.fields(jsonML[1]);
            for(field in fields) {
                attributes[field] = Reflect.field(jsonML[1], field);
            }
        }

        var children = jsonML.slice(restIndex).map(toTree);

        return JsonMLNode(jsonML[0], attributes, children);
    }

    // Convert to untyped representation
    public static function fromTree(tree: JsonMLTree): Dynamic {
        return switch(tree) {
        case JsonMLNode(tagName, attributes, elements):
            var object = {};
            for(field in attributes.keys()) {
                Reflect.setField(object, field, attributes[field]);
            }
            [tagName, object].concat(elements.map(fromTree));
        case JsonMLText(text):
            text;
        }
    }

    // Rewrite a tree
    public static function transform(tree: JsonMLTree, f: JsonMLTree -> JsonMLTree) {
        var transformed = f(tree);

        function recurse(tree: JsonMLTree) {
            return transform(tree, f);
        }

        return switch(transformed) {
        case JsonMLNode(name, attributes, children):
            JsonMLNode(name, attributes, children.map(recurse));
        case JsonMLText(_):
            transformed;
        }
    }

    // Convert to HTML string
    public static function render(tree: JsonMLTree) {
        return Markdown.renderJsonML(fromTree(tree));
    }
}
