package precog.html;

import jQuery.JQuery;
import precog.html.JQuerys;
import thx.core.Procedure;

@:native("bootstrap") extern class Bootstrap {
	public static inline function modal(el : JQuery, ?options : OptBootstrapModal) : Modal
		return new Modal(el, options);

    static function __init__() : Void
    {
        JQuerys;
        haxe.macro.Compiler.includeFile("precog/html/bootstrap.js");
    }
}

abstract Modal(Dynamic) {
	public function new(el : JQuery, ?options : OptBootstrapModal) {
		this = untyped el.modal(options);
	}

	public inline function toggle() : Modal
		return this.modal('toggle');

	public inline function show() : Modal
		return this.modal('show');

	public inline function hide() : Modal
		return this.modal('hide');

	public inline function el() : JQuery
		return cast this;

	public inline function onShow<T>(handler : ProcedureDef<T>) : Modal
		return this.el().on("show", handler);

	public inline function onShown<T>(handler : ProcedureDef<T>) : Modal
		return this.el().on("shown", handler);

	public inline function onHide<T>(handler : ProcedureDef<T>) : Modal
		return this.el().on("hide", handler);

	public inline function onHidden<T>(handler : ProcedureDef<T>) : Modal
		return this.el().on("hidden", handler);
}

typedef OptBootstrapModal = {
	?backdrop : Dynamic,
	?keyboard : Bool,
	?show : Bool,
	?remote : String
}