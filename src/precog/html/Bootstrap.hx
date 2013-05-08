package precog.html;

import jQuery.JQuery;
import precog.html.JQuerys;
import thx.core.Procedure;

class Dialog
{
	public static function confirm(message : String, success : Void -> Void)
	{
		var cancel = new HtmlButton("cancel"),
			ok = new HtmlButton("OK");
		ok.type = Primary;
		var dialog = createEmptyDialog(),
			el = dialog.el();
		el.find(".modal-header").hide();
		el.find(".modal-body").html(message);
		el.find(".modal-footer")
			.append(cancel.element)
			.append(ok.element);
		el.on("hidden", function() {
			el.remove();
		});
		ok.element.get(0).onclick = function() {
			dialog.hide();
			success();
		};
		cancel.element.get(0).onclick = function() {
			dialog.hide();
		};
	}

	static function createEmptyDialog(?options : OptBootstrapModal)
	{
		return Bootstrap.modal(new JQuery(DIALOG_HTML), options);
	}

	static var DIALOG_HTML = '<div class="modal hide fade in labcoat-dialog" role="dialog" aria-labelledby="dialog" aria-hidden="false" style="display: block;">
  <div class="modal-header"></div>
  <div class="modal-body"></div>
  <div class="modal-footer"></div>
<!--	<button id="account-create" class="btn btn-primary" tabindex="10">Create Account</button> -->
</div>';
}

@:native("bootstrap") extern class Bootstrap
{
	public static inline function modal(el : JQuery, ?options : OptBootstrapModal) : Modal
		return new Modal(el, options);

    static function __init__() : Void
    {
        JQuerys;
        haxe.macro.Compiler.includeFile("precog/html/bootstrap.js");
    }
}

abstract Modal(Dynamic)
{
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