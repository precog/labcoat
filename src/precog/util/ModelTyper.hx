package precog.util;

using thx.core.Strings;

class ModelTyper
{
	public static function guessFromManyObjects(it : Iterable<{}>)
	{
		var map = new Map<String, ValueType>(),
			allguessed = true;
		for(item in it) {
			allguessed = true;
			Reflect.fields(item).map(function(field) {
				if(map.exists(field) && !isUnknown(map.get(field)))
					return;
				var value = Reflect.field(item, field),
					type  = guess(value);
				map.set(field, type);
				if(isUnknown(type))
					allguessed = false;
			});
			if(allguessed) break;
		}
		return map;
	}
	public static function guessFromManyValues(it : Iterable<Dynamic>)
	{
		for(item in it) {
			var type = guess(item);
			if(!isUnknown(type))
				return type;
		}
		return Unknown;
	}

	public static function guess(value : Dynamic) : ValueType
	{
		if(Std.is(value, Array))
			return Value("Array", value.length > 0 ? [guess(value[0])] : [Unknown]);
		return switch(Type.typeof(value))
		{
			case TObject:
				var arr = Reflect.fields(value).map(function(name) {
					var v = Reflect.field(value, name);
					return {name : name, type : guess(v)};
				});
				Object(arr);
			case TInt:
				Value("Int", []);
			case TBool:
				Value("Bool", []);
			case TFloat:
				Value("Float", []);
			case TEnum(e):
				Value(Type.getEnumName(e), []);
			case TClass(c):
				Value(Type.getClassName(c), []);
			case TFunction:
				Function;
			case TUnknown | TNull:
				Unknown;
		}
	}

	public static function isUnknown(v : ValueType)
	{
		return switch(v) {
			case Unknown:
				true;
			case Object(fields):
				fields.filter(function(pair) return isUnknown(pair.type)).length > 0;
			case Value(_, p):
				p.filter(function(param) return isUnknown(param)).length > 0;
			case _:
				false;
		}
	}
}