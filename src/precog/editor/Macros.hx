package precog.editor;

import haxe.macro.Expr;

class Macros {
    // There has to be a better way than this...
    public static macro function jsRegExp(ereg: Expr) {
        return macro $ereg.r;
    }
}
