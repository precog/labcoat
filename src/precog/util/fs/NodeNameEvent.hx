package precog.util.fs;

class NodeNameEvent 
{
	public var oldname(default, null) : String;
	public var newname(default, null) : String;
	public var node(default, null) : Node;
	public function new(old : String, node : Node)
	{
		this.oldname = old;
		this.newname = node.name;
		this.node = node;
	}
}