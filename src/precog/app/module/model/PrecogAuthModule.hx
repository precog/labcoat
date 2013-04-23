package precog.app.module.model;

import precog.app.message.*;
import precog.communicator.*;
import thx.react.Promise;

class PrecogAuthModule extends Module
{
	public function new()
	{
		super();		
	}

	override function connect(communicator : Communicator)
	{
		var analyticsService	= 'https://devapi.precog.com',
			email				= "lc0001@precog.com",
			password			= "verysecretpassword",
			apiKey				= "532D09B5-421A-4F98-9009-7F221D14D85F",
			accountId			= "0000001476",
			basePath			= "/0000001476/";

		var auth = new PrecogAuth(analyticsService);
		communicator.provide(auth);
	}
}