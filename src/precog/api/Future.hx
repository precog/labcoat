package precog.api;

// TODO type Future? TAccept, TReject
extern class Future<TAccept, TFailure>
{
	public function then<TNAccept, TNFailure>(onaccept : FutureHandler<TAccept>, ?onreject : FutureHandler<TFailure>) : Future<TNAccept, TNFailure>;
	public function done(onaccept : FutureHandler<TAccept>, ?onreject : FutureHandler<TFailure>) : Void;
	inline public static function catchError<TFailure, TNAccept, TNFailure>(onreject : FutureHandler<TFailure>) : Future<TNAccept, TNFailure>
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

abstract FutureHandler<T>(T)
{
	private inline function new(h : T)
		this = h;

	@:from static public inline function fromProcedure0(h : Void -> Void)
		return new FutureHandler(h);

	@:from static public inline function fromProcedure1<T>(h : T -> Void)
		return new FutureHandler(h);

	@:from static public inline function fromProcedure2<T1, T2>(h : T1 -> T2 -> Void)
		return new FutureHandler(h);

	@:from static public inline function fromProcedure3<T1, T2, T3>(h : T1 -> T2 -> T3 -> Void)
		return new FutureHandler(h);

	@:from static public inline function fromProcedure4<T1, T2, T3, T4>(h : T1 -> T2 -> T3 -> T4 -> Void)
		return new FutureHandler(h);

	@:from static public inline function fromProcedure5<T1, T2, T3, T4, T5>(h : T1 -> T2 -> T3 -> T4 -> T5 -> Void)
		return new FutureHandler(h);

	@:from static public inline function fromFunction0<TAccept, TFailure>(h : Void -> Future<TAccept, TFailure>)
		return new FutureHandler(h);

	@:from static public inline function fromFunction1<T, TAccept, TFailure>(h : T -> Future<TAccept, TFailure>)
		return new FutureHandler(h);

	@:from static public inline function fromFunction2<T1, T2, TAccept, TFailure>(h : T1 -> T2 -> Future<TAccept, TFailure>)
		return new FutureHandler(h);

	@:from static public inline function fromFunction3<T1, T2, T3, TAccept, TFailure>(h : T1 -> T2 -> T3 -> Future<TAccept, TFailure>)
		return new FutureHandler(h);

	@:from static public inline function fromFunction4<T1, T2, T3, T4, TAccept, TFailure>(h : T1 -> T2 -> T3 -> T4 -> Future<TAccept, TFailure>)
		return new FutureHandler(h);

	@:from static public inline function fromFunction5<T1, T2, T3, T4, T5, TAccept, TFailure>(h : T1 -> T2 -> T3 -> T4 -> T5 -> Future<TAccept, TFailure>)
		return new FutureHandler(h);
}