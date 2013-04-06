package precog.editor.vega;

@:native("vg") extern class Vega 
{
	public static var parse(default, null) : {
		@:overload(function(spec : {}, handler : VegaConstructor -> Void) : Void {})
		public function spec(spec : String, handler : VegaConstructor -> Void) : Void;
	};

	static function __init__() : Void
    {
    	haxe.macro.Compiler.includeFile("precog/editor/vega/d3.js");
        haxe.macro.Compiler.includeFile("precog/editor/vega/vega.js");
    }
}

typedef VegaConstructor = VegaParams -> VegaView;

typedef VegaParams = {
	el : Dynamic,
	?data : {},
	?hover : Bool,
	?renderer : String
}

extern class VegaView
{
	public function width(v : Int) : VegaView;
	public function height(v : Int) : VegaView;
	public function padding(v : {
		?top : Int,
		?bottom : Int,
		?left : Int,
		?right : Int,
	}) : VegaView;
	public function viewport(v : Array<Int>) : VegaView;
	public function renderer(v : String) : VegaView;
	// TODO add rest documented here: https://github.com/trifacta/vega/wiki/Runtime
	public function update() : VegaView;
}