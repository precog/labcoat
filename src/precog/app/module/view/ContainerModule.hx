package precog.app.module.view;

import precog.communicator.*;
import js.html.Element;
import js.Browser;
import js.JQuery;
import precog.layout.DockLayout;
import precog.layout.Panel;
import precog.geom.IRectangleObservable;
using thx.react.IObservable;
import precog.html.HtmlPanel;
import precog.app.message.HtmlApplicationContainerMessage;


class ContainerModule extends Module
{
	override public function connect(comm : Communicator)
	{
		JQuery.cur.ready(function(_) {
			var container = new JQuery(".labcoat-container");
			if(null == container.get(0))
				container = new JQuery('<div class="labcoat-container"></div>').appendTo(js.Browser.document.body);
			comm.provide(new HtmlApplicationContainerMessage(container));
		});
	}
}