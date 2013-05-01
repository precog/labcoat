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
		// TODO
		// load credentials from sessionStorage
		communicator.provide(new RequestPrecogCredentials());
	}
}