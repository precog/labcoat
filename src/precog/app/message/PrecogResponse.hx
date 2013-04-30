package precog.app.message;

class PrecogResponse
{
	public var uid(default, null) : String;
	public var api(default, null) : String;
	public var description(default, null) : String;
	public var time(default, null) : Date;
	public var responseTime(default, null) : Float;
	public function new(request : PrecogRequest) 
	{
		this.uid = request.uid;
		this.api = request.api;
		this.time = Date.now();
		this.responseTime = this.time.getTime() - request.time.getTime();
	}
}

class ResponseError extends PrecogResponse
{
	public function new(err : Dynamic, request : PrecogRequest)
	{
		super(request);
		this.description = 'error! $err';
	}
}

class ResponseMetadataChildren extends PrecogResponse
{
	public var parent(default, null) : String;
	public var children(default, null) : Array<FileDescription>;
	public function new(parent : String, children : Array<FileDescription>, request : PrecogRequest)
	{
		super(request);
		this.parent = parent;
		this.children = children;
		var display = children.slice(0, 5).map(function(o) return o.name);
		if(display.length < children.length)
			display.push('...');
		this.description = 'metadata children at $parent: ${display.length == 0 ? "[none]" : display.join(", ")}';
	}
}
/*
class ResponseMetadataPath extends PrecogResponse
{
	public var path(default, null) : String;
	public var children(default, null) : Array<FileDescription>;
	public function new(path : String, children : Array<FileDescription>, request : PrecogRequest)
	{
		super(request);
		this.children = children;
		this.path = path;
		this.description = 'metadata for $path: ${children.length}';
	}
}
*/
typedef FileDescription = {
	type : String,
	name : String
}