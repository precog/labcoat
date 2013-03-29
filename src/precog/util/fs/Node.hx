package precog.util.fs;

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
			parent.addNode(this);
		}
	}

	function init() { }

	function get_name() return name;
	function set_name(value)
	{
		if(value == "" || value == null)
			throw "invalid value (empty or null)";
		if(value == this.name)
			return value;
		var old = this.name;
		this.name = value;
		trigger(new NodeNameEvent(old, this));
		return value;
	}

	function get_isSystem()
		return name.substr(0, 1) == ".";

	function escape(s : String)
		return StringTools.replace(s, "/", "\\/");
	public function toString() return name;
	public function remove()
	{
		if(null != parent)
		{
			var p = parent;
			parent.removeNode(this);
			trigger(new NodeRemoveEvent(this, p));
		}
	}

	macro function trigger<T>(ethis : haxe.macro.Expr, values : Array<haxe.macro.Expr>)
	{
		return macro { if(null != $ethis.filesystem) $ethis.filesystem.dispatcher.trigger($a{values}); };
	}
}