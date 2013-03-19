package precog.layout;

import precog.geom.Point;
import precog.geom.Rectangle;
import precog.geom.IRectangleObservable;
import thx.react.IObservable;
import thx.react.Observable;

/**
TODO:
	- add GridLayout http://wpftutorial.net/GridLayout.html
	- add UniformGridLayout

quickstart: http://www.codeproject.com/Articles/30904/WPF-Layouts-A-Visual-Quick-Start
*/

@:access(precog.layout.Panel)
class Layout
{
	
	public var size(default, null) : Point;
	public var boundaries(get_boundaries, null) : IRectangleObservable;
	public var onpanel(default, null) : {
		add : IObservable<Panel>,
		remove : IObservable<Panel>
	};
	var measuredBoundaries : Rectangle;
	var panels : LayoutPanels;
	function new(width : Float, height : Float)
	{
		this.size = new Point(width, height);
		this.measuredBoundaries = new Rectangle();
		this.panels = new LayoutPanels(this);
		this.onpanel = {
			add : panels.observableAdd,
			remove : panels.observableRemove
		};
	}

	inline function get_boundaries() return measuredBoundaries;

	var updateQueue : Array<Void -> Void>;
	function createUpdateQueue()
	{
		return [panelIteratorFunction(updatePanel)];
	}

	function panelIteratorFunction(f : Panel -> Void)
	{
		return function() {
			for(panel in panels)
				f(panel);
		}
	}

	public function update()
	{
		updateQueue = createUpdateQueue();
		measuredBoundaries.wrapSuspended(function() {
			for(panel in panels)
				panel.frame.suspend();
			resetBoundaries();
			while(updateQueue.length > 0)
				updateQueue.shift()();
			for(panel in panels)
				panel.frame.resume();
		});
	}

	function resetBoundaries()
	{
		measuredBoundaries.set(Math.NaN, Math.NaN, Math.NaN, Math.NaN);
	}

	function updatePanel(panel : Panel)
	{

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