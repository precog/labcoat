package precog.app.module.view;

import precog.communicator.*;
import js.Browser;
import jQuery.JQuery;
import precog.layout.DockLayout;
import precog.layout.Panel;
import precog.layout.Extent;
import precog.html.HtmlPanel;
import precog.app.message.ApplicationHtmlContainerMessage;
import precog.app.message.MainHtmlPanelMessage;
import precog.app.message.SystemHtmlPanelGroupMessage;
import precog.app.message.SupportHtmlPanelGroupMessage;
import precog.app.message.ToolsHtmlPanelGroupMessage;
import precog.geom.Rectangle;

using precog.html.HtmlPanelGroup;
using precog.html.JQuerys;
using thx.react.IObservable;

class LayoutModule extends Module
{
	var container : JQuery;
	var panelMargin : Int = 3;
	var mainLayout    : DockLayout;
	var contextLayout : DockLayout;

#if (html5 || cordova)
	var menu    : HtmlPanel;
#end
	var mainHtmlPanel : HtmlPanel;
	var contextPanel : Panel;
	var groups : LayoutGroups;

	function updateLayouts()
	{
		var size = container.getInnerSize(),
			vertical = size.width < size.height;

		// TODO, this should not be required but it is :(
		mainLayout.clear();
		contextLayout.clear();

		mainLayout.rectangle.set(0, 0, size.width, size.height);
#if (html5 || cordova)
		mainLayout.addPanel(menu).dockTop(20);
#end
		groups.dockIfExists("tools", mainLayout, Bottom(groups.dockSize(["tools"], 100)));


		if(vertical) {
			mainLayout.addPanel(contextPanel).dockLeft(
				groups.dockSize(["system", "support"], 200)
			);
			groups.dockIfExists("system", contextLayout, Top(0.5));
			groups.dockIfExists("support", contextLayout, Fill, Left);
		} else {
			mainLayout.addPanel(contextPanel).dockLeft(groups.dockSize(["system"], 200));
			groups.dockIfExists("system", contextLayout, Fill);
			groups.dockIfExists("support", mainLayout, Right(groups.dockSize(["support"], 250)), Right);
		}
	
		mainLayout.addPanel(mainHtmlPanel).fill();
		mainLayout.update();
		contextLayout.update();
	}

	function onMessage(comm : Communicator, message : ApplicationHtmlContainerMessage)
	{

		container = message.value;
		container.addClass("labcoat");
		groups = new LayoutGroups(container);
		contextPanel = new Panel();
#if (html5 || cordova)
		menu = new HtmlPanel("menu", container);
#end
		mainHtmlPanel = new HtmlPanel("main", container);

		mainLayout = new DockLayout(0, 0);
		contextLayout = new DockLayout(0, 0);

		mainLayout.defaultMargin = panelMargin;
		contextLayout.defaultMargin = panelMargin;

		contextPanel.rectangle.addListener(function(rect) {
			contextLayout.rectangle.set(rect.x, rect.y, rect.width, rect.height);
		});

        comm.provide(new SystemHtmlPanelGroupMessage(groups.ensureGroup("system", Left, updateLayouts).group));
        comm.provide(new SupportHtmlPanelGroupMessage(groups.ensureGroup("support", Right, updateLayouts).group));
        comm.provide(new ToolsHtmlPanelGroupMessage(groups.ensureGroup("tools", Bottom, updateLayouts).group));
        
        updateLayouts();

        comm.provide(new MainHtmlPanelMessage(mainHtmlPanel));

		new JQuery(Browser.window).resize(function(_) updateLayouts());
	}

	override public function connect(comm : Communicator)
	{
		comm.demand(ApplicationHtmlContainerMessage)
			.then(onMessage.bind(comm, _));
	}
}

class LayoutGroups
{
	var map : Map<String, { group : HtmlPanelGroup, panel : Panel }>;
	var container : JQuery;
	public function new(container : JQuery)
	{
		map = new Map();
		this.container = container;
	}

	public function ensureGroup(name : String, position : GutterPosition, update : Void -> Void)
	{
		var group = map.get(name);
		if(null == group)
			map.set(name, group = createGroup(name, position, update));
		return group;
	}

	public function getGroup(name : String)
	{
		return map.get(name);
	}

	function createGroup(name : String, position : GutterPosition, update : Void -> Void)
	{
		var panel  = new Panel(),
			result = {
				panel : panel,
				group : new HtmlPanelGroup(container, panel.rectangle, position),
			};
		result.group.events.activate.on(function(current) update());
		return result;
	}

	public function dockIfExists(name : String, layout : DockLayout, dock : DockKind, ?gutterPosition : GutterPosition)
	{
		var group = map.get(name);
		if(null == group)
			return;
		layout.addPanel(group.panel).setDock(dock);
		if(null != gutterPosition)
			group.group.gutterPosition = gutterPosition;
	}

	public function dockSize(names : Array<String>, openSize : Extent) : Extent
	{
		var found = null;
		for(name in names)
		{
			var group = map.get(name);
			if(null == group)
				continue;
			if(null != group.group.current)
				return openSize;
			found = group;
		}
		if(null == found)
			return Absolute(0);
		return Absolute(found.group.gutterSize);
	}
}