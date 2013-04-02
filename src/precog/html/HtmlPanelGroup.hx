package precog.html;

import jQuery.JQuery;
import precog.geom.IRectangle;
import precog.geom.IRectangleObservable;
import precog.layout.DockLayout;
import precog.layout.Panel;
import thx.react.IObserver;
import thx.react.Signal;
using thx.react.IObservable;
using precog.html.JQuerys;
using precog.html.HtmlButton;

@:access(precog.html.HtmlPanelGroupItem.setGroup)
class HtmlPanelGroup implements IObserver<IRectangle>
{
	public var length(default, null) : Int;
	var items : Array<HtmlPanelGroupItem>;
	public var current(default, null) : HtmlPanelGroupItem;
	public var container(default, null) : JQuery;
	public var pane(default, null) : Panel;
	public var gutter(default, null) : HtmlPanel;
	public var togglesContainer(default, null) : JQuery;
	var layout : DockLayout;
	var gutterMargin : Int = 0;
	public var gutterSize(default, null) : Int;
	public var events(default, null) : {
		public var activate(default, null) : Signal1<HtmlPanelGroupItem>;
	};
	@:isVar public var buttonSize(get, set) : ButtonSize;
	public var buttonType : ButtonType;

	@:isVar public var gutterPosition(get_gutterPosition, set_gutterPosition) : GutterPosition;

	public function new(parent : JQuery, rectangle : IRectangleObservable, ?gutterPosition : GutterPosition)
	{
		events = {
			activate : new Signal1()
		};
		length = 0;
		items = [];
		current = null;
		container = parent;
		buttonSize = Mini;
		buttonType = Default;
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

	function get_buttonSize()
		return buttonSize;
	function set_buttonSize(value)
	{
		buttonSize = value;
		var button = new HtmlButton("Sample", value);
		var div = new JQuery('<div class="gutter"></div>').appendTo(new JQuery(".labcoat"));
		button.element.appendTo(div);
		gutterSize = button.element.outerHeight(true);
		var parent = container.parent();
		div.remove();
		return value;
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

	function deactivate(item : HtmlPanelGroupItem)
	{
		current = null;
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
		togglesContainer
                    .css("top",  '0px')
                    .css("left", '0px');

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
		updateVerticalPosition();
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
				togglesContainer.cssTransform('rotateZ(90deg) translate3d(${offset}px, ${offset}px, 0)');
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

@:access(precog.html.HtmlPanelGroup)
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
		group.events.activate.trigger(this);
	}

	public function deactivate()
	{
		if(null == group || !active) return;
		group.deactivate(this);
		toggle.active = active = false;
		panel.hide();
		group.events.activate.trigger(null);
	}

	function setGroup(group : HtmlPanelGroup)
	{
		this.group = group;
		this.toggle.size = group.buttonSize;
		this.toggle.type = group.buttonType;
	}

	public function toString()
		return 'HtmlGroupItem (${toggle.text})';
}