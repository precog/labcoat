package precog.app.message;

class Message<T> 
{
	public var value(default, null) : T;
	public function new(value : T)
	{
		this.value = value;
	}

	public function toString() 
		return '${Type.getClassName(Type.getClass(this)).split(".").pop()} (${Std.string(value)})';
}