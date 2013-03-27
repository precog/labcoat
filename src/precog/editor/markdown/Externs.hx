package precog.editor.markdown;

@:native("markdown") extern class Markdown {
    static function toHTML(source: String): String;

    static function __init__() : Void
    {
        haxe.macro.Compiler.includeFile("precog/editor/markdown/markdown.js");
    }
}
