package precog.module.api;

import precog.communicator.*;

class VersionModule extends Module
{
	override public function connect(comm : Communicator)
	{
		comm.demand(labcoat.message.JavaScriptAPI)
			.then(function(msg : labcoat.message.JavaScriptAPI) {
				msg.api.version = precog.macro.VersionMacro.gitVersion();
			});
	}
}