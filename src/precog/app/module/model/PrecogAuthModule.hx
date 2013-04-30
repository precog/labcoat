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
//		var config = new PrecogConfig(analyticsService, apiKey, basePath);
//		communicator.queue(new PrecogNamedConfig("default", config));

		var config = new PrecogConfig("https://nebula.precog.com/", "D99DFC4E-91F4-4F3A-BB07-51F0A5109F16");
		communicator.queue(new PrecogNamedConfig("default", config));
	}
}