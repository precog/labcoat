package precog.app.message;

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

class RequestMetadataChildren extends PrecogRequest
{
	public var path(default, null) : String;
	public function new(path : String, ?api : String)
	{
		super(api);
		this.path = path;
		this.description = 'metadata children at $path';
	}
}