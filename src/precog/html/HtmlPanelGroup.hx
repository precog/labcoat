package precog.html;

import js.JQuery;
import precog.geom.IRectangle;
import precog.geom.IRectangleObservable;
import precog.layout.DockLayout;
import precog.layout.Panel;
import thx.react.IObserver;
using thx.react.IObservable;
using precog.html.JQuerys;

@:access(precog.html.HtmlPanelGroupItem.setGroup)
class HtmlPanelGroup implements IObserver<IRectangle>
{
	public var length(default, null) : Int;
	var items : Array<HtmlPanelGroupItem>;
	var current : HtmlPanelGroupItem;
	public var container(default, null) : JQuery;
	public var pane(default, null) : Panel;
	public var gutter(default, null) : HtmlPanel;
	public var togglesContainer(default, null) : JQuery;
	var layout : DockLayout;
	var gutterMargin : Int = 3;
	var gutterSize : Int = 18;

	@:isVar public var gutterPosition(get_gutterPosition, set_gutterPosition) : GutterPosition;

	public function new(parent : JQuery, rectangle : IRectangleObservable, ?gutterPosition : GutterPosition)
	{
		length = 0;
		items = [];
		current = null;
		container = parent;

		layout = new DockLayout(0, 0);
		pane   = new Panel();
		gutter = new HtmlPanel();
		gutter.element.addClass("gutter");
		togglesContainer = new JQuery('<div class="btn-group"></div>').appendTo(gutter.element);

		container.append(gutter.element);

		if(null == gutterPosition)
			gutterPosition = Top;
		this.gutterPosition = gutterPosition;
		rectangle.addListener(update);
		update(rectangle);
	}

	public function update(rect : IRectangle) {
		layout.rectangle.set(rect.x, rect.y, rect.width, rect.height);
		layout.update();
	}

	public function addItem(item : HtmlPanelGroupItem) 
	{
		items.remove(item);
		items.push(item);
		item.setGroup(this);
		togglesContainer.append(item.toggle.element);
		container.append(item.panel.element);
		length = items.length;
		updateVerticalPosition();
		pane.rectangle.attach(item.panel);
		item.panel.update(pane.rectangle);
	}

	public function removeItem(item : HtmlPanelGroupItem) 
	{
		if(!items.remove(item)) return;
		item.toggle.element.detach();
		item.panel.element.detach();
		pane.rectangle.detach(item.panel);
		updateVerticalPosition();
		item.setGroup(null);
		length = items.length;
	}

	function activate(item : HtmlPanelGroupItem)
	{
		for(other in items)
			if(other != item)
				other.deactivate();
		current = item;
	}

	function get_gutterPosition()
		return gutterPosition;

	function set_gutterPosition(position : GutterPosition)
	{
		if(Type.enumEq(gutterPosition, position)) return position;
		if(null != gutterPosition) switch (gutterPosition) {
			case Top:
				togglesContainer.removeClass("toggles-top");
			case Bottom:
				togglesContainer.removeClass("toggles-bottom");
			case Left:
				togglesContainer.removeClass("toggles-left");
			case Right:
				togglesContainer.removeClass("toggles-bottom");
		}
		gutterPosition = position;
		layout.clear();
		togglesContainer.css({
			top  : '0px',
			left : '0px'
		});
		switch (gutterPosition) {
			case Top:
				togglesContainer.addClass("toggles-top");
				layout.addPanel(gutter.panel).dockTop(gutterSize, gutterMargin);
			case Bottom:
				togglesContainer.addClass("toggles-bottom");
				layout.addPanel(gutter.panel).dockBottom(gutterSize, gutterMargin);
			case Left:
				togglesContainer.addClass("toggles-left");
				layout.addPanel(gutter.panel).dockLeft(gutterSize, gutterMargin);
			case Right:
				togglesContainer.addClass("toggles-right");
				layout.addPanel(gutter.panel).dockRight(gutterSize, gutterMargin);
		}
		layout.addPanel(pane).fill();
		layout.update();
		return position;
	}

	function updateVerticalPosition() {
		switch (gutterPosition) {
			case Left:
				var size = togglesContainer.getOuterSize(),
					w = size.width,
					h = size.height;
				var offset = (w - h) / 2;
				togglesContainer.cssTransform('rotateZ(-90deg) translate3d(-${offset}px, -${offset}px, 0)');
			case Right:
				var size = togglesContainer.getOuterSize(),
					w = size.width,
					h = size.height;
				var offset = (w - h) / 2;
				togglesContainer.cssTransform('rotateZ(90deg) translate3d(${offset-length/2}px, ${offset+length}px, 0)');
			case _:
				togglesContainer.cssTransform('none');
		}
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
	public var panel(default, null) : HtmlPanelSwap;
	public var group(default, null) : HtmlPanelGroup;
	public var active(default, null) : Bool;

	public function new(label : String, ?icon : String)
	{
		this.active = false;
		this.toggle = new HtmlButton(label, icon);
		this.toggle.size = Mini;
//		this.toggle.rightIcon = Icons.heart;
		this.panel = new HtmlPanelSwap();
		this.panel.hide();
		this.toggle.element.bind("click", click);
	}

	function click(_) 
	{
		if(active)
			deactivate();
		else
			activate();
	}

	public function activate()
	{
		if(null == group || active) return;
		group.activate(this);
		toggle.active = active = true;
		panel.show();
	}

	public function deactivate()
	{
		if(null == group || !active) return;	
		toggle.active = active = false;
		panel.hide();
	}

	function setGroup(group : HtmlPanelGroup)
	{
		this.group = group;
	}
}