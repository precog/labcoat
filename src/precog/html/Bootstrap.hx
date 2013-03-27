package precog.html;

import precog.html.JQuerys;

@:native("bootstrap") extern class Bootstrap {
    static function __init__() : Void
    {
        JQuerys;
        haxe.macro.Compiler.includeFile("precog/html/bootstrap.js");
    }
}
