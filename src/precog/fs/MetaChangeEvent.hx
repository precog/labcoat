package precog.fs;

class MetaChangeEvent 
{
	public var key(default, null) : String;
	public var oldvalue(default, null) : Dynamic;
	public var newvalue(default, null) : Dynamic;
	public var node(default, null) : Node;
	public function new(node : Node, key : String, oldvalue : Dynamic, newvalue : Dynamic)
	{
		this.node = node;
		this.key = key;
		this.oldvalue = oldvalue;
		this.newvalue = newvalue;
	}
}