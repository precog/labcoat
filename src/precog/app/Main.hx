package precog.app;

import precog.communicator.ModuleManager;
import js.JQuery;
import precog.app.module.view.*;

class Main 
{
	static function main()
	{
		var manager = new ModuleManager();
		manager.addModule(new ContainerModule());
		manager.addModule(new LayoutModule());
	}
}