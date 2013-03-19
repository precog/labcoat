package precog.app;

import precog.communicator.ModuleManager;
import js.JQuery;

class Main 
{
	static function main()
	{
		JQuery.cur.ready(function(e) {
			var container = new JQuery(".labcoat-container").get(0);
			if(null == container)
				container = new JQuery('<div class="labcoat-container"></div>').appendTo(new JQuery("body")).get(0);
			var manager = new ModuleManager();
			manager.addModule(new precog.app.module.LayoutModule(container));
		});
	}
}