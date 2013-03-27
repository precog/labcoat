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
		this.name = name;
		this.parent = parent;
		if(null != parent)
			this.filesystem = parent.filesystem;
	}

	function get_name() return name;
	function set_name(value) return this.name = value;

	public function toString() return name;
}

class File extends Node
{
	public function new(name : String, parent : Directory)
	{
		super(name, parent);
		isFile = true;
		isDirectory = false;
		isRoot = false;
	}
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
		isFile = false;
		isDirectory = true;
		isRoot = false;
	}

	public function add(node : Node)
	{
		if(Std.is(node, Root)) throw "root node cannot be added or removed";
		if(null != node.parent)
			node.parent.remove(node);
		children.push(node);
		length++;
		if(node.isFile)
			filesLength++;
		if(node.isDirectory)
			directoriesLength++;

	}

	public function remove(node : Node)
	{
		if(Std.is(node, Root)) throw "root node cannot be added or removed";
		if(children.remove(node)) {
			length--;
			if(node.isFile)
				filesLength--;
			if(node.isDirectory)
				directoriesLength--;
			return true;
		} else {
			return false;
		}
	}

	public function directories()
		return children.filter(function(v) return Std.is(v, Directory)).iterator();

	public function files()
		return children.filter(function(v) return Std.is(v, File)).iterator();


	public function childNodes()
		return children.iterator();
}

class Root extends Directory
{
	function new(filesystem : FileSystem)
	{
		super("", null);
		isRoot = true;
		this.filesystem = filesystem;
	}
}