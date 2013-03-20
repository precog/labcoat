package precog.editor.markdown;

@:native("markdown") extern class Markdown {
    static function toHTML(source: String): String;
}
