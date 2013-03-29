package precog.util.fs;

class NodeAddEvent 
{
	public var node(default, null) : Node;
	public function new(node : Node)
	{
		this.node = node;
	}
}