package precog.editor.markdown;

import utest.Assert;

using precog.editor.markdown.JsonML;

class TestJsonML {
    public function new() { }

    public function testRenderFromTo() {
        var tree = JsonML.toTree(
            ['html', {},
             ['div', {style: 'background: #F00'}, 'Hello']]
        );

        Assert.equals(
            '<div style="background: #F00">Hello</div>',
            tree.render()
        );
    }

    public function testJsonMLTransform() {
        var tree = JsonMLNode('html', new Map(), [JsonMLNode('div', new Map(), [])]);

        var transformed = tree.transform(function(tree) {
            return switch(tree) {
            case JsonMLNode('div', _, _): JsonMLText('was a div');
            case _: tree;
            }
        });

        Assert.equals(
            'was a div',
            transformed.render()
        );
    }
}
