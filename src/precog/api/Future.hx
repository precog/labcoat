package precog.api;

extern class Future<TAccept, TFailure>
{
	public function then(onaccept : TAccept, ?onreject : TFailure) : Future<TAccept, TFailure>;

	public function done(onaccept : TAccept, ?onreject : TFailure) : Void;
	inline public static function catchError<TFailure, TNAccept, TNFailure>(onreject : TFailure) : Future<TNAccept, TNFailure>
		return untyped precog.api.Future["catch"](onreject);

	@:overload(function<TAccept, TFailure>(v1 : Dynamic, v2 : Dynamic, v3 : Dynamic, v4 : Dynamic, v5 : Dynamic) : Future<TAccept, TFailure> {})
	@:overload(function<TAccept, TFailure>(v1 : Dynamic, v2 : Dynamic, v3 : Dynamic, v4 : Dynamic) : Future<TAccept, TFailure> {})
	@:overload(function<TAccept, TFailure>(v1 : Dynamic, v2 : Dynamic, v3 : Dynamic) : Future<TAccept, TFailure> {})
	@:overload(function<TAccept, TFailure>(v1 : Dynamic, v2 : Dynamic) : Future<TAccept, TFailure> {})
	@:overload(function<TAccept, TFailure>(v1 : Dynamic) : Future<TAccept, TFailure> {})
	public static function any<TFailure>() : Future<Void -> Void, TFailure>;

	@:overload(function<TAccept, TFailure>(v1 : Dynamic, v2 : Dynamic, v3 : Dynamic, v4 : Dynamic, v5 : Dynamic) : Future<TAccept, TFailure> {})
	@:overload(function<TAccept, TFailure>(v1 : Dynamic, v2 : Dynamic, v3 : Dynamic, v4 : Dynamic) : Future<TAccept, TFailure> {})
	@:overload(function<TAccept, TFailure>(v1 : Dynamic, v2 : Dynamic, v3 : Dynamic) : Future<TAccept, TFailure> {})
	@:overload(function<TAccept, TFailure>(v1 : Dynamic, v2 : Dynamic) : Future<TAccept, TFailure> {})
	@:overload(function<TAccept, TFailure>(v1 : Dynamic) : Future<TAccept, TFailure> {})
	public static function every<TFailure>() : Future<Void -> Void, TFailure>;

	static function __init__() : Void
	{
		var api = untyped __js__('(precog || (precog = {})) && (precog.api || (precog.api = {}))');
		if(untyped window)
			api.Future = untyped window.Future;
		else
			api.Future = untyped require("Future");
	}
}