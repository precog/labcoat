package precog.editor.markdown;

import utest.Assert;

class TestRenderer {
    public function new() { }

    public function testRenderText() {
        Assert.equals(
            Renderer.render([MarkdownText('Hello world'), MarkdownText('World')]),
            'Hello world\nWorld'
        );
    }

    public function testRenderHeader() {
        Assert.equals(
            Renderer.render([MarkdownContentElement(MarkdownH1, [MarkdownText('Header!')], new Map())]),
            '<h1>Header!</h1>'
        );
    }

    public function testRenderImage() {
        var attributes = new Map();
        attributes.set("src", "test.jpg");
        attributes.set("alt", "");

        // Test might be relying on unspecified object iteration.
        Assert.equals(
            Renderer.render([MarkdownEmptyElement(MarkdownIMG, attributes)]),
            '<img src="test.jpg" alt="" />'
        );
    }

    public function testRenderElementWithText() {
        Assert.equals(
            Renderer.render([MarkdownContentElement(MarkdownP, [MarkdownText("Hello")], new Map()), MarkdownContentElement(MarkdownH1, [MarkdownText("World!")], new Map())]),
            '<p>Hello</p>\n<h1>World!</h1>'
        );
    }
}
