package precog.editor.mathjax;

import js.html.Node;

@:native("MathJax") extern class MathJax {
    static var Hub: {
        Config: {} -> Void,
        Typeset: Node -> ?(Void -> Void) -> Void,
        Queue: Array<Dynamic> -> Void
    };

    static function __init__() : Void
    {
        haxe.macro.Compiler.includeFile("precog/editor/mathjax/MathJax.js");
        MathJax.Hub.Config({
            root: "mathjax",
            displayAlign: "left"
        });
        haxe.macro.Compiler.includeFile("precog/editor/mathjax/config/TeX-AMS_HTML-full.js");

        // For some reason can't embed fontdata.js
        // Have to include it in resources
    }
}
