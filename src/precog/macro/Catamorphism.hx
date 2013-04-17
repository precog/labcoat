package precog.macro;

import haxe.macro.Expr;
import haxe.macro.Context;

class Catamorphism {
#if macro
    public static function build(classes: Array<String>) {
        var fields = Context.getBuildFields();
        fields.push(cataMethod(classes, null));
        return fields;
    }

    public static function autoBuild(classes: Array<String>) {
        var fields = Context.getBuildFields();
        var name = Context.getLocalClass().get().name;
        var index = Lambda.indexOf(classes, name);
        fields.push(cataMethod(classes, macro return $i{'_${index}'}($i{"this"})));
        return fields;
    }

    static function cataMethod(classes: Array<String>, body: Expr): Field {
        var types = classes.map(function(s: String) return Context.getType(s));

        var a = TPath({name: 'A', pack: [], params: []});

        var args = [];
        for(index in 0...classes.length) {
            var className = classes[index];
            args.push({
                name: '_${index}',
                type: TFunction([Context.toComplexType(types[index])], a),
                opt: false,
                value: null
            });
        }

        return {
            name: "cata",
            access: [APublic],
            pos: Context.currentPos(),
            kind: FFun({
                args: args,
                expr: body,
                params: [{name: 'A'}],
                ret: a
            })
        };
    }
#end
}
