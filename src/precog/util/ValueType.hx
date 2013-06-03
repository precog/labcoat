package precog.util;

enum ValueType
{
	Value(type : String, params : Array<ValueType>);
	Object(fields : Array<{name : String, type : ValueType}>);
	Function;
	Unknown;
}