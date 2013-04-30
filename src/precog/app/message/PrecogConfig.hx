package precog.app.message;

using thx.core.Strings;

class PrecogConfig 
{
	public var analyticsService	: String;
	public var apiKey			: String;

	public function new(analyticsService : String, apiKey : String) 
	{
		setAnalyticsService(analyticsService);
		this.apiKey = apiKey;
	}

	function setAnalyticsService(service : String)
		analyticsService = service.rtrim("/");

		
//	public var email			: String;
//	public var password			: String;
//	public var accountId		: String;
}