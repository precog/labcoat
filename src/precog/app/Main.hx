package precog.app;

import precog.communicator.ModuleManager;
import js.JQuery;

class Main 
{
	static function main()
	{
		JQuery.cur.ready(function(e) {
			var container = new JQuery(".labcoat-container,body").get(0);
			if(null == container)
				throw "invalid HTML container for labcoat";
			var manager = new ModuleManager();
			manager.addModule(new precog.app.module.LayoutModule(container));
		});
	}
}