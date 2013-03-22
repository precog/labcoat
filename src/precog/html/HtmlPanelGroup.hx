package precog.html;

import js.JQuery;
import precog.geom.IRectangle;
import precog.geom.IRectangleObservable;
import precog.layout.DockLayout;
import thx.react.IObserver;
using thx.react.IObservable;

@:access(precog.html.HtmlPanelGroupItem.setGroup)
class HtmlPanelGroup implements IObserver<IRectangle>
{
	public var length(default, null) : Int;
	var items : Array<HtmlPanelGroupItem>;
	var current : HtmlPanelGroupItem;
	public var container : HtmlPanel;
	public var pane : HtmlPanel;
	public var gutter : HtmlPanel;
	var layout : DockLayout;
	var gutterMargin : Int = 3;
	var gutterSize : Int = 22;

	@:isVar public var gutterPosition(get_gutterPosition, set_gutterPosition) : GutterPosition;

	public function new(container : HtmlPanel, ?gutterPosition : GutterPosition)
	{
		length = 0;
		items = [];
		current = null;
		this.container = container;

		layout = new DockLayout(0, 0);
		pane = new HtmlPanel();
		gutter = new HtmlPanel();

		container.element.append(gutter.element);
		container.element.append(pane.element);

		if(null == gutterPosition)
			gutterPosition = Top;
		this.gutterPosition = gutterPosition;
		container.panel.rectangle.attach(this);
		update(container.panel.rectangle);
	}

	public function update(rect : IRectangle) {
		layout.rectangle.set(rect.x, rect.y, rect.width, rect.height);
		layout.update();
	}

	public function addItem(item : HtmlPanelGroupItem) 
	{
		items.remove(item);
		items.push(item);
		gutter.element.append(item.toggle.element);
		pane.element.append(item.panel.element);
		length = items.length;
	}

	public function removeItem(item : HtmlPanelGroupItem) 
	{
		if(!items.remove(item)) return;
		item.toggle.element.detach();
		item.panel.element.detach();
		item.setGroup(null);
		length = items.length;
	}

	function activate(item : HtmlPanelGroupItem)
	{
		for(item in items)
			item.deactivate();
		if(null != item)
			item.activate();
		current = item;
	}

	function get_gutterPosition()
		return gutterPosition;

	function set_gutterPosition(position : GutterPosition)
	{
		if(Type.enumEq(gutterPosition, position)) return position;
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
		this.toggle = new HtmlButton("hello world", Icons.ok);
		this.toggle.size = Mini;
		this.panel = panel;
	}

	public function activate()
	{
		if(active) return;
		if(group != null)
		{
			group.pane.panel.rectangle.attach(panel);
			group.activate(this);
		}
		toggle.active = true;
		panel.show();
		panel.update(group.pane.panel.rectangle);
	}

	public function deactivate()
	{
		if(!active) return;	
		toggle.active = false;
		panel.hide();
		if(null != group)
			group.pane.panel.rectangle.detach(panel);
	}

	function setGroup(group : HtmlPanelGroup)
	{
		if(null == group)
			deactivate();
		this.group = group;
	}
}