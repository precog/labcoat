package precog.app.module.view;

import precog.communicator.*;
import js.Browser;
import js.JQuery;
import precog.layout.DockLayout;
import precog.layout.Panel;
import precog.html.HtmlPanel;
import precog.app.message.HtmlApplicationContainerMessage;
import precog.app.message.HtmlMainPanelMessage;
import precog.app.message.HtmlSystemPanelMessage;
import precog.app.message.HtmlSupportPanelMessage;
import precog.app.message.HtmlToolsPanelMessage;

using precog.html.JQuerys;
using thx.react.IObservable;

class LayoutModule extends Module
{
	var comm: Communicator;

	var container : JQuery;
	var panelMargin : Int = 3;
	var layouts : {
		main    : DockLayout,
		context : DockLayout
	};

#if (html5 || cordova)
	var menu    : HtmlPanel;
#end
	var system  : HtmlPanel;
	var main    : HtmlPanel;
	var support : HtmlPanel;
	var tools   : HtmlPanel;
	var context : Panel;

	function updateLayouts()
	{
		var size = container.getInnerSize(),
			vertical = size.width < size.height;
		// TODO, this should not be required but it is :(
		layouts.main.clear();
		layouts.context.clear();

		layouts.main.rectangle.set(0, 0, size.width, size.height);
#if (html5 || cordova)
		layouts.main.addPanel(menu.panel).dockTop(20);
#end
		layouts.main.addPanel(tools.panel).dockBottom(100);

		layouts.main.addPanel(context).dockLeft(200);

		if(vertical) {
			layouts.context.addPanel(system.panel).dockTop(0.5);
			layouts.context.addPanel(support.panel).fill();
		} else {
			layouts.main.addPanel(support.panel).dockRight(250);
			layouts.context.addPanel(system.panel).fill();
		}
	
		layouts.main.addPanel(main.panel).fill();

		layouts.main.update();
		layouts.context.update();
	}

	function oncontainer(message : HtmlApplicationContainerMessage)
	{
		container = message.value;
		container.addClass("labcoat");
		context = new Panel();
#if (html5 || cordova)
		menu    = new HtmlPanel("menu", container);
#end
		main    = new HtmlPanel("main", container);
		system  = new HtmlPanel("system", container);
		support = new HtmlPanel("support", container);
		tools   = new HtmlPanel("tools", container);

		layouts = {
			main    : new DockLayout(0, 0),
			context : new DockLayout(0, 0),
		};
		layouts.main.defaultMargin = panelMargin;
		layouts.context.defaultMargin = panelMargin;

		context.rectangle.addListener(function(rect) {
			layouts.context.rectangle.set(rect.x, rect.y, rect.width, rect.height);
		});

		updateLayouts();
		new JQuery(Browser.window).resize(function(_) {
			updateLayouts();
		});

        comm.provide(new HtmlMainPanelMessage(main));
        comm.provide(new HtmlSystemPanelMessage(system));
        comm.provide(new HtmlSupportPanelMessage(support));
        comm.provide(new HtmlToolsPanelMessage(tools));
	}

	override public function connect(comm : Communicator)
	{
		this.comm = comm;

		comm.demand(HtmlApplicationContainerMessage)
			.then(oncontainer);
	}
}