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

//		var config = new PrecogConfig(analyticsService, apiKey, basePath);
//		communicator.queue(new PrecogNamedConfig("default", config));

		var config = new PrecogConfig("https://nebula.precog.com/", "D99DFC4E-91F4-4F3A-BB07-51F0A5109F16", "/0000000094/");
		communicator.queue(new PrecogNamedConfig("alt", config));
	}
}