package precog.app.module.model;

import precog.communicator.*;
import thx.react.Promise;
import precog.api.*;

class PrecogModule extends Module
{
	public function new()
	{
		super();		
	}

	override function connect(communicator : Communicator)
	{
		var api = new Precog({
				analyticsService : 'https://devapi.precog.com'
			}),
			account = { email : "lc0001@precog.com", password : "verysecretpassword" };
		api.describeAccount(account).then(function(info) {
			trace(info);
		});
	}
}