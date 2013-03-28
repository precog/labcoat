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
	public var isSystem(get, null) : Bool;
	public function new(name : String, parent : Directory)
	{
		this.init();
		this.name = name;
		if(null != parent)
		{
			parent.add(this);
		}
	}

	function init() { }

	function get_name() return name;
	function set_name(value) return this.name = value;

	function get_isSystem()
		return name.substr(0, 1) == ".";

	function escape(s : String)
		return StringTools.replace(s, "/", "\\/");
	public function toString() return name;
}

class File extends Node
{
	public var meta(default, null) : Meta;
	public var extension(get, set) : String;
	public var baseName(get, set) : String;
	public function new(name : String, parent : Directory)
	{
		super(name, parent);
		meta = new Meta();
	}

	function get_extension()
	{
		var parts = name.split(".");
		return parts.length == 1 ? "" : parts.pop();
	}
	function set_extension(value : String)
	{
		name = baseName + (null == value || "" == value ? "" : "." + value);
		return value;
	} 
	function get_baseName()
		return name.split(".").slice(0, -1).join(".");
	function set_baseName(value : String)
	{
		var ext = extension;
		name = value + (ext == "" ? "" : "." + ext);
		return value;
	}

	override function init()
	{
		isFile = true;
		isDirectory = false;
		isRoot = false;
	}

	override public function toString()
		return null == parent ? name : parent.toString() + (parent.isRoot ? "" : "/") + escape(name);
}

class Meta
{
	var map : Map<String, Dynamic>;
	public function new()
		map = new Map<String, Dynamic>();
	public function get(key : String)
		return map.get(key);
	public function set(key : String, value : Dynamic)
	{
		map.set(key, value);
		return this;
	}
	public function remove(key : String)
		return map.remove(key);
	public function exists(key : String)
		return map.exists(key);
	public function keys()
		return map.keys();
	public function iterator()
		return map.iterator();
	public function setMap(other : Map<String, Dynamic>)
	{
		
	}
	public function setObject(ob : Dynamic)
	{
		
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
		node.filesystem = this.filesystem;
		length++;
		if(node.isFile)
			filesLength++;
		if(node.isDirectory)
			directoriesLength++;
	}

	public function remove(node : Node)
	{
		if(node.isRoot) throw "root node cannot be added or removed";
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

	public function directories() : Array<File>
		return cast children.filter(function(v : Node) return v.isDirectory).copy();

	public function files() : Array<Directory>
		return cast children.filter(function(v : Node) return v.isFile).copy();

	public function nodes()
		return children.copy();

	override public function toString()
		return (null == parent ? escape(name) : parent.toString() + (parent.isRoot ? "" : "/") + escape(name));
}

class Root extends Directory
{
	function new(filesystem : FileSystem)
	{
		super("[ROOT]", null);
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