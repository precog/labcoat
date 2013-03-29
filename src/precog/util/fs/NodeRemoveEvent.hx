package precog.util.fs;

class NodeRemoveEvent 
{
	public var parent(default, null) : Directory;
	public var node(default, null) : Node;
	public function new(node : Node, parent : Directory)
	{
		this.node = node;
		this.parent = parent;
	}
}