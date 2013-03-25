package precog.html;

@:native("bootstrap") extern class Bootstrap {
    static function __init__() : Void
    {
        #if embed_js
        haxe.macro.Compiler.includeFile("precog/html/bootstrap.js");
        #end
    }
}
