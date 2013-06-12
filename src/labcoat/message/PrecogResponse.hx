package labcoat.message;

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

class ResponseListChildren extends PrecogResponse
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
		this.description = 'list children at $parent: ${display.length == 0 ? "[none]" : display.join(", ")}';
	}
}

class ResponseMetadata extends PrecogResponse
{
	public var parent(default, null) : String;
	public var metadata(default, null) : Dynamic;
	public function new(parent : String, metadata : Map<String, precog.util.ValueType>, request : PrecogRequest)
	{
		super(request);
		this.parent = parent;
		this.metadata = metadata;
		this.description = 'metadata for $parent: ${metadata}';
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
	public var path(default, null) : String;
	public function new(path : String, request : PrecogRequest)
	{
		super(request);
		this.path = path;
		this.description = Type.getClassName(Type.getClass(this)).split(".").pop().substr(8).humanize() + ' for $path';
	}
}

class ResponseFileGet extends ResponseFileBase
{
	public var content(default, null) : FileData;
	public function new(path : String, content : FileData, request : PrecogRequest)
	{
		super(path, request);
		this.content = content;
	}
}

class ResponseFileDelete extends ResponseFileBase
{

}

class ResponseFileCreate extends ResponseFileBase 
{

}

class ResponseFileExist extends ResponseFileBase 
{
	public var exist(default, null) : Bool;
	public function new(path : String, exist : Bool, request : PrecogRequest)
	{
		super(path, request);
		this.path = path;
		this.exist = exist;
		this.description = Type.getClassName(Type.getClass(this)).split(".").pop().substr(8).humanize() + ' for $path, exists: $exist';
	}
}

class ResponseDirectoryExist extends ResponseFileBase 
{
	public var exist(default, null) : Bool;
	public function new(path : String, exist : Bool, request : PrecogRequest)
	{
		super(path, request);
		this.path = path;
		this.exist = exist;
		this.description = Type.getClassName(Type.getClass(this)).split(".").pop().substr(8).humanize() + ' for $path, exists: $exist';
	}
}

class ResponseFileUpload extends ResponseFileBase 
{

}

typedef FileExecutionErrorPosition = {
	column: Int,
	line: Int,
	text: String
}

typedef FileExecutionError = {
	message: String,
	position: FileExecutionErrorPosition,
	timestame: String
}

typedef FileExecution = {
	data: Array<Dynamic>,
	errors: Array<FileExecutionError>,
	warnings: Array<FileExecutionError>,
	serverErrors: Array<String>, // TODO check String is the correct type
	serverWarnings: Array<String> // TODO check String is the correct type
}

class ResponseFileExecute extends ResponseFileBase 
{
	public var result(default, null) : FileExecution;
	public function new(path : String, result : FileExecution, request : PrecogRequest)
	{
		super(path, request);
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
		this.description = 'move directory from ${this.src} to ${this.dst}';
	}
}

class ResponseNotebookMove extends PrecogResponse 
{
	public var src(default, null) : String;
	public var dst(default, null) : String;
	public function new(src : String, dst : String, request : PrecogRequest)
	{
		super(request);
		this.src = src;
		this.dst = dst;
		this.description = 'move notebook from ${this.src} to ${this.dst}';
	}
}

class ResponseFileMove extends PrecogResponse 
{
	public var src(default, null) : String;
	public var dst(default, null) : String;
	public function new(src : String, dst : String, request : PrecogRequest)
	{
		super(request);
		this.src = src;
		this.dst = dst;
		this.description = 'move file from ${this.src} to ${this.dst}';
	}
}

typedef FileData = {
	contents : String,
	type : String
}