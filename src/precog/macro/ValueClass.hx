package precog.macro;

import haxe.macro.Expr;
import haxe.macro.Context;

@:remove @:autoBuild(precog.macro.ValueClassImpl.build())
extern interface ValueClass {}

class ValueClassImpl {
#if macro
    public static function build() {
        var fields = Context.getBuildFields();
        var args = [];
        var states = [],
            tostring = [];
        for (f in fields) {
            switch (f.kind) {
            case FVar(t, _):
                args.push({name: f.name, type: t, opt: false, value: null});
                states.push(macro $p{["this", f.name]} = $i{f.name});
                tostring.push(macro __b.push($v{f.name} + " : " + $p{["this", f.name]}));
                f.kind = FProp("default", "null", t);
                f.access.push(APublic);
            default:
            }
        }
        fields.push({
            name: "new",
            access: [APublic],
            pos: Context.currentPos(),
            kind: FFun({
                args: args,
                expr: macro $b{states},
                params: [],
                ret: null
            })
        });

        var type = Context.getLocalClass().toString().split('.').pop();
        fields.push({
            name: "toString",
            access: [APublic],
            pos: Context.currentPos(),
            kind: FFun({
                args: [],
                expr: macro {
                    var __b = [];
                    $b{tostring};
                    return $v{type} + (__b.length == 0 ? "" : " {" + __b.join(",") + "}");
                },
                params: [],
                ret: TPath({ pack : [], name : "String", params : [], sub : null })
            })
        });
        return fields;
    }
#end
}
