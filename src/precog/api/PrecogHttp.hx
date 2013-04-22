package precog.api;

extern class PrecogHttp 
{
//	public function new(options : PrecogHttpOptions) : Void;

	public static function http<TSuccess, TFailure, TProgress>(options : PrecogHttpOptions<TSuccess, TFailure, TProgress>) : Future<TSuccess, TFailure>;
	public static function jsonp<TSuccess, TFailure, TProgress>(options : PrecogHttpOptions<TSuccess, TFailure, TProgress>) : Future<TSuccess, TFailure>;
	public static function nodejs<TSuccess, TFailure, TProgress>(options : PrecogHttpOptions<TSuccess, TFailure, TProgress>) : Future<TSuccess, TFailure>;

	public static function get<TSuccess, TFailure, TProgress>(options : PrecogHttpOptions<TSuccess, TFailure, TProgress>) : Future<TSuccess, TFailure>;
	public static function put<TSuccess, TFailure, TProgress>(options : PrecogHttpOptions<TSuccess, TFailure, TProgress>) : Future<TSuccess, TFailure>;
	public static function post<TSuccess, TFailure, TProgress>(options : PrecogHttpOptions<TSuccess, TFailure, TProgress>) : Future<TSuccess, TFailure>;
	public static function delete0<TSuccess, TFailure, TProgress>(options : PrecogHttpOptions<TSuccess, TFailure, TProgress>) : Future<TSuccess, TFailure>;
	inline public static function catchError<TSuccess, TFailure, TProgress>(options : PrecogHttpOptions<TSuccess, TFailure, TProgress>) : Future<TSuccess, TFailure>
		return untyped precog.api.PrecogHttp["catch"](options);

	static function __init__() : Void
	{
		var api = untyped __js__('(precog || (precog = {})) && (precog.api || (precog.api = {}))');
		if(untyped window)
			api.PrecogHttp = untyped window.Precog.http;
		else
			api.PrecogHttp = untyped require("Precog").http;
	}
}

typedef PrecogHttpOptions<TSuccess, TFailure, TProgress> = {
	?basicAuth	: { username : String, password : String },
	?method		: String,
	?url		: String,
	?query		: { apiKey : String },
	?content	: {},
	?success	: TSuccess -> Void,
	?failure	: TFailure -> Void,
	?progress	: TProgress -> Void
}

typedef PrecogQuery = {
	?apiKey     : String,
	?q          : String,
	?limit      : Int,
	?basePath   : String,
	?skip       : Int,
	?order      : Dynamic,
	?sortOn     : String,
	?sortOrder  : String,
	?timeout    : Float,
	?prefixPath : String,
	?format     : String
}