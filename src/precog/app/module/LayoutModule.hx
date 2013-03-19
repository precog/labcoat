package precog.app.module;

import precog.communicator.*;
import js.html.Element;
import js.Browser;
import js.JQuery;
import precog.layout.DockLayout;
import precog.layout.Panel;
using thx.react.IObservable;

class LayoutModule extends Module
{
	var container : JQuery;
	public function new(container : Element)
	{
		this.container = new JQuery(container);
		this.container.addClass("labcoat");
		this.container.css({
			"background-color":"#f99",
			width: "100%",
			height: "100%",
			position:"absolute",
			overflow:"hidden"
		});
	}

	function createDomPanel(panel : Panel) {
		var el = new JQuery('<div class="panel" style="position:absolute"></div>').appendTo(container),
			frame = panel.frame;
		frame.addListener(function(rect) {
			el.css({
				top    : rect.y + "px",
				left   : rect.x + "px",
				width  : rect.width + "px",
				height : rect.height + "px"
			});
		});
	};

	override public function connect(comm : Communicator)
	{
		var size = getSize();
trace(size);

		var bottom = new Panel(),
			left   = new Panel(),
			right  = new Panel(),
			main   = new Panel();

		var layout = new DockLayout(size.width, size.height);
#if (html5 || cordova)
		var menu = new Panel();
		layout.addPanel(menu).dockTop(20);
		createDomPanel(menu);
#end
		layout.addPanel(bottom).dockBottom(150);
		createDomPanel(bottom);
		layout.addPanel(left).dockLeft(150);
		createDomPanel(left);
		layout.addPanel(right).dockRight(150);
		createDomPanel(right);
		layout.addPanel(main).fill();
		createDomPanel(main);

		layout.update();

		new JQuery(Browser.window).resize(function(_) {
			var size = getSize();
			layout.size.set(size.width, size.height);
			layout.update();
		});
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