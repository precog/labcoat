package precog.util.fs;

class Nodes<T>
{
	public var length(default, null) : Int;
	var nodes : Array<T>;
	var directory : Directory;
	function new(directory : Directory)
	{
		this.nodes = [];
		this.directory = directory;
		this.length = 0;
	}

	function add(node : T)
	{
		nodes.push(node);
		length++;
	}

	function remove(node : T)
	{
		if(nodes.remove(node))
		{
			length--;
			return true;
		} else {
			return false;
		}
	}

	public function list()
		return nodes.copy();

	public function iterator()
		return nodes.copy().iterator();
}