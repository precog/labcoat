package precog.util;

@:access(precog.util.Root)
class FileSystem 
{
	public var root(default, null) : Root;
	public function new()
	{
		root = new Root(this);
	}
}

class Node
{
	@:isVar public var name(get, set) : String;
	public var filesystem(default, null) : FileSystem;
	public var parent(default, null) : Directory;
	public var isFile(default, null) : Bool;
	public var isDirectory(default, null) : Bool;
	public var isRoot(default, null) : Bool;
	public function new(name : String, parent : Directory)
	{
		this.init();
		this.name = name;
		if(null != parent)
		{
			this.filesystem = parent.filesystem;
			parent.add(this);
		}
	}

	function init() { }

	function get_name() return name;
	function set_name(value) return this.name = value;

	public function toString() return name;
}

class File extends Node
{
	public function new(name : String, parent : Directory)
	{
		super(name, parent);
	}

	override function init()
	{
		isFile = true;
		isDirectory = false;
		isRoot = false;
	}

	override public function toString()
		return null == parent ? name : parent.toString() + name;
}

class Directory extends Node
{
	var children : Array<Node>;
	public var length(default, null) : Int;
	public var directoriesLength(default, null) : Int;
	public var filesLength(default, null) : Int;
	public function new(name : String, parent : Directory)
	{
		super(name, parent);
		children = [];
		length = directoriesLength = filesLength = 0;
	}

	override function init()
	{
		isFile = false;
		isDirectory = true;
		isRoot = false;
	}

	public function add(node : Node)
	{
		if(node.isRoot) throw "root node cannot be added or removed";
		if(null != node.parent)
			node.parent.remove(node);
		children.push(node);
		node.parent = this;
		length++;
		if(node.isFile)
			filesLength++;
		if(node.isDirectory)
			directoriesLength++;
	}

	public function remove(node : Node)
	{
		if(node.isRoot) throw "root node cannot be added or removed";
		trace('remove $node');
		if(children.remove(node)) {
			length--;
			if(node.isFile)
				filesLength--;
			trace(directoriesLength);
			if(node.isDirectory)
				directoriesLength--;
			trace(directoriesLength);
			return true;
		} else {
			return false;
		}
	}

	public function directories()
		return children.filter(function(v : Node) return v.isDirectory).iterator();

	public function files()
		return children.filter(function(v : Node) return v.isFile).iterator();

	public function nodes()
		return children.iterator();

	override public function toString() return (null == parent ? name : parent.toString() + name) + "/";
}

class Root extends Directory
{
	function new(filesystem : FileSystem)
	{
		super("", null);
		this.filesystem = filesystem;
	}

	override function init()
	{
		isFile = false;
		isDirectory = true;
		isRoot = true;
	}

	override public function toString() return "/";
}