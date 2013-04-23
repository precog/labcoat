package precog.app.module.api;

import precog.communicator.*;

class VersionModule extends Module
{
	override public function connect(comm : Communicator)
	{
		comm.demand(precog.app.message.JavaScriptAPI)
			.then(function(msg : precog.app.message.JavaScriptAPI) {
				msg.api.version = precog.macro.VersionMacro.gitVersion();
			});
	}
}