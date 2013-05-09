package precog.app.message;

using thx.core.Strings;

class PrecogRequest 
{
	public var uid(default, null) : String;
	public var api(default, null) : String;
	public var description(default, null) : String;
	public var time(default, null) : Date;
	function new(?api : String) 
	{
		this.uid = precog.util.Uid.create();
		this.api = null == api ? "default" : api;
		this.time = Date.now();
	}
}

class Helper
{
	public static function normalizeFilePath(p : String)
	{
		return "/" + p.trim("/");
	}
	public static function normalizeDirectoryPath(p : String)
	{
		var p = "/" + p.trim("/") + "/";
		if(p == "//")
			return "/";
		else
			return p;
	}
}

class RequestMetadataChildren extends PrecogRequest
{
	public var path(default, null) : String;
	public function new(path : String, ?api : String)
	{
		super(api);
		this.path = Helper.normalizeDirectoryPath(path);
		this.description = 'metadata children at ${this.path}';
	}
}

class RequestFileBase extends PrecogRequest
{
	public var filePath(default, null) : String;
	public function new(filePath : String, ?api : String)
	{
		super(api);
		this.filePath = Helper.normalizeFilePath(filePath);
		this.description = 'request ' + Type.getClassName(Type.getClass(this)).split(".").pop().substr(7).humanize() + ' for $filePath';
	}
}

class RequestFileGet extends RequestFileBase
{
	
}

class RequestFileCreate extends RequestFileBase 
{
	public var type(default, null) : String;
	public var contents(default, null) : String;
	public function new(filePath : String, type : String, contents : String, ?api : String)
	{
		super(filePath, api);
		this.type = type;
		this.contents = contents;
	}
}

class RequestFileUpload extends RequestFileBase 
{
	public var type(default, null) : String;
	public var contents(default, null) : String;
	public function new(filePath : String, type : String, contents : String, ?api : String)
	{
		super(filePath, api);
		this.type = type;
		this.contents = contents;
	}
}

class RequestFileMove extends PrecogRequest
{
	public var src(default, null) : String;
	public var dst(default, null) : String;
	public function new(src : String, dst : String, ?api : String)
	{
		super(api);
		this.src = src;
		this.dst = dst;
		this.description = 'move file from ${this.src} to ${this.dst}';
	}
}

class RequestFileDelete extends RequestFileBase
{

}

class RequestFileExecute extends RequestFileBase 
{
	public var maxAge(default, null) : Null<Float>;
	public var maxStale(default, null) : Null<Float>;
	public function new(filePath : String, ?maxage : Float, ?maxstale : Float, ?api : String)
	{
		super(filePath, api);
		this.maxAge = maxage;
		this.maxStale = maxstale;
	}

}

class RequestDirectoryDelete extends RequestFileBase
{

}

class RequestDirectoryMove extends PrecogRequest 
{
	public var src(default, null) : String;
	public var dst(default, null) : String;
	public function new(src : String, dst : String, ?api : String)
	{
		super(api);
		this.src = Helper.normalizeDirectoryPath(src);
		this.dst = Helper.normalizeDirectoryPath(dst);
		this.description = 'move directory from ${this.src} to ${this.dst}';
	}
}