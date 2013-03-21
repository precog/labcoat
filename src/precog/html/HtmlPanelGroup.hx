package precog.html;

import js.JQuery;
import precog.geom.IRectangle;
import precog.geom.IRectangleObservable;
import precog.layout.DockLayout;
import thx.react.IObserver;
using thx.react.IObservable;

@:access(precog.html.HtmlPanelGroupItem.setGroup)
class HtmlPanelGroup
{
	public var length(default, null) : Int;
	var panels : Array<HtmlPanelGroupItem>;
	var current : HtmlPanelGroupItem;
	public var boundaries : IRectangleObservable;
	public var pane : HtmlPanel;
	public var gutter : HtmlPanel;
	var layout : DockLayout;

	@:isVar public var gutterPosition(get_gutterPosition, set_gutterPosition) : GutterPosition;

	public function new(boundaries : IRectangleObservable, ?gutterPosition : GutterPosition)
	{
		length = 0;
		panels = [];
		current = null;
		this.boundaries = boundaries;

		layout = new DockLayout(0, 0);
		pane = new HtmlPanel();
		gutter = new HtmlPanel();
		if(null == gutterPosition)
			gutterPosition = Left;
		this.gutterPosition = gutterPosition;

		boundaries.addListener(function(rect) {
			layout.rectangle.set(rec.x, rect.y, rect.width, rect.height);
		});
	}

	public function addPanel(panel : HtmlPanelGroupItem) 
	{
		if(panels.remove(panel))
			length--;
		panels.push(panel);
		length++;
	}

	public function removePanel(panel : HtmlPanelGroupItem) 
	{
		if(!panels.remove(panel)) return;
		panel.setGroup(null);
		length--;
	}

	function activate(panel : HtmlPanelGroupItem)
	{
		for(panel in panels)
			panel.deactivate();
		if(null != panel)
			panel.activate();
		current = panel;
	}

	function get_gutterPosition()
		return gutterPosition;

	function set_gutterPosition(position : GutterPosition)
	{
		if(Reflect.enumEq(gutterPosition, position)) return position;
		gutterPosition = position;
		updateDock();
		return position;
	}

	function updateDock()
	{
		layout.clear();
		switch (gutterPosition) {
			case Top:		layout.addPanel(gutter.panel).dockTop(gutterSize, gutterMargin);
			case Bottom:	layout.addPanel(gutter.panel).dockBottom(gutterSize, gutterMargin);
			case Left:		layout.addPanel(gutter.panel).dockLeft(gutterSize, gutterMargin);
			case Right:		layout.addPanel(gutter.panel).dockRight(gutterSize, gutterMargin);
		}
		layout.addPanel(pane.panel);
		layout.update();
	}
}

enum GutterPosition
{
	Top;
	Right;
	Bottom;
	Left;
}

@:access(precog.html.HtmlPanelGroup.activate)
class HtmlPanelGroupItem 
{
	public var toggle(default, null) : HtmlButton;
	public var panel(default, null) : HtmlSwapPanel;
	public var group(default, null) : HtmlPanelGroup;
	public var active(default, null) : Bool;

	public function new(panel : HtmlSwapPanel)
	{
		this.active = false;
		this.toggle = new HtmlButton();
		this.panel = panel;
	}

	public function activate()
	{
		if(active) return;
		if(group != null)
		{
			group.pane.attach(panel);
			group.activate(panel);
		}
		toggle.active = true;
		panel.show();
		panel.update(group.pane);
	}

	public function deactivate()
	{
		if(!active) return;	
		toggle.active = false;
		panel.hide();
		if(null != group)
			group.pane.detach(panel);
	}

	function setGroup(group : HtmlPanelGroup)
	{
		if(null == group)
			deactivate();
		this.group = group;
	}
}