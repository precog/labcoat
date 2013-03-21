package precog.app.module.api;

import precog.communicator.*;

class VersionModule extends Module
{
	override public function connect(comm : Communicator)
	{
		comm.demand(precog.app.message.JavaScriptAPIMessage)
			.then(function(message : precog.app.message.JavaScriptAPIMessage) {
				message.value.version = VersionMacro.gitVersion();
			});
	}
}