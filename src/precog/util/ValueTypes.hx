package precog.util;

class ValueTypes
{
	public static function toString(v : ValueType)
	{
		return switch (v) {
			case Value(type, params):
				type + (params.length == 0 ? "" : "<" + params.map(toString).join(",") + ">");
			case Object(fields):
				"{" + [for(field in fields) field.name + " : " + toString(field.type)].join(", ") + "}";
			case Function:
				"[function]";
			case Unknown:
				"[unknown]";
		}
	}
}