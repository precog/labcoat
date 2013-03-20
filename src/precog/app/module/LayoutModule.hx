package precog.app.module;

import precog.communicator.*;
import js.html.Element;
import js.Browser;
import js.JQuery;
import precog.layout.DockLayout;
import precog.layout.Panel;
import precog.geom.IRectangleObservable;
using thx.react.IObservable;
import precog.html.HtmlPanel;

class LayoutModule extends Module
{
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

	public function new(container : Element)
	{
		this.container = new JQuery(container);
	}

	function updateLayouts()
	{
		var size = getSize(),
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

	override public function connect(comm : Communicator)
	{
		container.addClass("labcoat");
		context = new Panel();
#if (html5 || cordova)
		menu = new HtmlPanel("menu", container);
#end
		main = new HtmlPanel("main", container);
		system = new HtmlPanel("system", container);
		support = new HtmlPanel("support", container);
		tools = new HtmlPanel("tools", container);

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
	}

	var timer : haxe.Timer;
	function reduce(handler : Void -> Void)
	{
		if(null != timer)
			timer.stop();
		timer = haxe.Timer.delay(handler, 50);
	}

	function getSize()
	{
		var jq = new JQuery(container);
		return {
			width : jq.innerWidth(),
			height : jq.outerHeight()
		};
	}

	override public function disconnect(comm : Communicator)
	{

	}
}