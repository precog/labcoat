package precog.app.message;

using thx.core.Strings;

class PrecogConfig 
{
	public var analyticsService	: String;
	public var apiKey			: String;
	public var basePath			: String;

	public function new(analyticsService : String, apiKey : String, basePath : String) 
	{
		setAnalyticsService(analyticsService);
		this.apiKey = apiKey;
		setBasePath(basePath);
	}

	function setAnalyticsService(service : String)
		analyticsService = service.rtrim("/");

	function setBasePath(path : String)
		basePath = path.trim("/");
		
//	public var email			: String;
//	public var password			: String;
//	public var accountId		: String;
}