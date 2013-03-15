package precog.layout;

import precog.geom.Point;
import precog.geom.Rectangle;
import thx.react.IObservable;
import thx.react.Observable;

// add added/removed events
@:access(precog.layout.Panel)
class Layout
{
	
	public var size(default, null) : MutablePoint;
	public var boundaries(get_boundaries, null) : Rectangle;
	public var onpanel(default, null) : {
		add : IObservable<Panel>,
		remove : IObservable<Panel>
	};
	var calculatedBoundaries : MutableRectangle;
	var panels : LayoutPanels;
	function new(width : Float, height : Float)
	{
		this.size = new MutablePoint(width, height);
		this.calculatedBoundaries = new MutableRectangle();
		this.panels = new LayoutPanels(this);
		this.onpanel = {
			add : panels.observableAdd,
			remove : panels.observableRemove
		};
	}

	inline function get_boundaries() return calculatedBoundaries;

	public function update()
	{
		for(panel in panels)
			updatePanel(panel);
	}

	function updatePanel(panel : Panel)
	{
		throw "abstract method, must override";
	}

	public function iterator()
		return panels.iterator();
}

@:access(precog.layout.Panel.setLayout)
class LayoutPanels
{
	var panels : Array<Panel>;
	var layout : Layout;
	public var observableAdd(default, null) : Observable<Panel>;
	public var observableRemove(default, null) : Observable<Panel>;
	public function new(layout : Layout)
	{
		this.layout = layout;
		panels = [];
		observableAdd = new Observable<Panel>();
		observableRemove = new Observable<Panel>();
	}

	public function addPanel(panel : Panel)
	{
		panel.setLayout(layout);
		panels.push(panel);
		observableAdd.notify(panel);
	}

	public function removePanel(panel : Panel)
	{
		panel.setLayout(null);
		panels.remove(panel);
		observableRemove.notify(panel);
	}

	public function clear()
	{
		var all = panels.copy();
		while(all.length > 0)
			removePanel(all.shift());
	}

	inline public function iterator()
		return panels.iterator();
}

/**
USEFUL RESOURCES
intro:
http://wpftutorial.net/LayoutProperties.html
stack:
http://wpftutorial.net/StackPanel.html
grid:
http://wpftutorial.net/GridLayout.html
dock:
http://wpftutorial.net/DockPanel.html
canvas:
http://wpftutorial.net/Canvas.html
wrap:
http://wpftutorial.net/WrapPanel.html
viewbox:
http://wpftutorial.net/ViewBox.html


custom:
http://wpftutorial.net/CustomLayoutPanel.html

quickstart: http://www.codeproject.com/Articles/30904/WPF-Layouts-A-Visual-Quick-Start

*/