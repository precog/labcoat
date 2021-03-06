package labcoat.module.view;

import precog.communicator.*;
import jQuery.JQuery;
import labcoat.message.ApplicationHtmlContainer;

class ContainerModule extends Module
{
	override public function connect(comm : Communicator)
	{
		new JQuery(js.Browser.window).ready(function() {
			var container = new JQuery(".labcoat-container");
			if(null == container.get(0))
				container = new JQuery('<div class="labcoat-container"></div>').appendTo(js.Browser.document.body);
			comm.provide(new ApplicationHtmlContainer(container));
		});
	}
}