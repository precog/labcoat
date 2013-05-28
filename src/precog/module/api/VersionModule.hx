package precog.module.api;

import precog.message.*;
import precog.communicator.*;

class VersionModule extends Module
{
	override public function connect(comm : Communicator)
	{
		var version = precog.macro.VersionMacro.gitVersion();
		comm.provide(new ApplicationVersion(version));
		comm.demand(labcoat.message.JavaScriptAPI)
			.then(thx.core.Procedure.ProcedureDef.fromArity1(function(msg : labcoat.message.JavaScriptAPI) {
				msg.api.version = version;
			}));
	}
}