package labcoat.message;

class NodeInfo
{
	public var path(default, null) : String;
	public var type(default, null) : NodeType;
	public var api(default, null) : String;
	public var meta(default, null) : Map<String, Dynamic>;
	public function new(path : String, type : NodeType, api : String, meta : Map<String, Dynamic>)
	{
		this.path = path;
		this.type = type;
		this.api  = api;
		this.meta = meta;
	}

	public function toString()
	{
		var t = Type.getClassName(Type.getClass(this)).split(".").pop();
		return '$t ($api, $type, $path)';
	}
}

enum NodeType
{
	Notebook;
	Directory;
	File;
}