package precog.app.module.view;

import precog.communicator.*;
import js.JQuery;
import precog.app.message.ApplicationHtmlContainerMessage;

class ContainerModule extends Module
{
	override public function connect(comm : Communicator)
	{
		JQuery.cur.ready(function(_) {
			var container = new JQuery(".labcoat-container");
			if(null == container.get(0))
				container = new JQuery('<div class="labcoat-container"></div>').appendTo(js.Browser.document.body);
			comm.provide(new ApplicationHtmlContainerMessage(container));
		});
	}
}