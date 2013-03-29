package precog.util.fs;

class File extends Node
{
	public var meta(default, null) : Meta;
	public var extension(get, set) : String;
	public var baseName(get, set) : String;
	public function new(name : String, parent : Directory)
	{
		super(name, parent);
		meta = new Meta(this);
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