package precog.app.message;

using thx.core.Strings;

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
	public var children(default, null) : Array<FileDescriptionMeta>;
	public function new(parent : String, children : Array<FileDescriptionMeta>, request : PrecogRequest)
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

typedef FileDescription = {
	type : String,
	name : String
}

typedef FileDescriptionMeta = {
	>FileDescription,
	metadata : Map<String, Dynamic>
}

class ResponseFileBase extends PrecogResponse
{
	public var filePath(default, null) : String;
	public function new(filePath : String, request : PrecogRequest)
	{
		super(request);
		this.filePath = filePath;
		this.description = 'response ' + Type.getClassName(Type.getClass(this)).split(".").pop().substr(8).humanize() + ' for $filePath';
	}
}

class ResponseFileGet extends ResponseFileBase
{
	public var content(default, null) : FileData;
	public function new(filePath : String, content : FileData, request : PrecogRequest)
	{
		super(filePath, request);
		this.content = content;
	}
}

class ResponseFileCreate extends ResponseFileBase 
{

}

class ResponseFileUpload extends ResponseFileBase 
{

}

typedef FileExecution = {
    data: Array<Dynamic>
};

class ResponseFileExecute extends ResponseFileBase 
{
	public var result(default, null) : FileExecution;
	public function new(filePath : String, result : FileExecution, request : PrecogRequest)
	{
		super(filePath, request);
		this.result = result;
	}
}

class ResponseDirectoryDelete extends ResponseFileBase
{

}

class ResponseDirectoryMove extends PrecogResponse 
{
	public var src(default, null) : String;
	public var dst(default, null) : String;
	public function new(src : String, dst : String, request : PrecogRequest)
	{
		super(request);
		this.src = src;
		this.dst = dst;
		this.description = 'response move directory from ${this.src} to ${this.dst}';
	}
}

typedef FileData = {
	contents : String,
	type : String
}