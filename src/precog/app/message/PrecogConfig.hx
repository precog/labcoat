package precog.app.message;

using thx.core.Strings;

class PrecogConfig 
{
	public var analyticsService(default, null) : String;
	public var apiKey(default, null) : String;
	public var accountId(default, null) : String;

	public function new(analyticsService : String, apiKey : String, accountId : String) 
	{
		setAnalyticsService(analyticsService);
		setAccountId(accountId);
		this.apiKey = apiKey;
	}

	function setAnalyticsService(service : String)
		analyticsService = service.rtrim("/");

	function setAccountId(accountId : String)
		this.accountId = accountId.rtrim("/");

		
//	public var email			: String;
//	public var password			: String;
}