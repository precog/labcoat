package precog.layout;

using thx.react.IObservable;
using precog.geom.Rectangle;
using precog.layout.Extent;

@:access(precog.geom.Point)
@:access(precog.layout.DockPanel)
class DockLayout extends Layout
{
	var docks : Map<Panel, DockPanel>;
	public function new(width : Float, height : Float)
	{
		super(width, height);
		docks = new Map();
		onpanel.remove.addListener(function(panel) {
			docks.remove(panel);
		});
	}

	public function addPanel(panel : Panel) : DockPanel
	{
		panels.addPanel(panel);
		var dock = new DockPanel();
		docks.set(panel, dock);
		return dock;
	}

	override function createUpdateQueue()
	{
		return [beforeUpdate, panelIteratorFunction(measurePanel), afterMeasure, panelIteratorFunction(updatePanel), afterUpdate];
	}

	var available : Rectangle;
	var fillqueue : Array<Panel>;

	function beforeUpdate() 
	{
		available = new Rectangle(0, 0, 0, 0);
		fillqueue = [];
	}

	function measurePanel(panel : Panel)
	{
		var fl : Float;
		switch(docks.get(panel).dock)
		{
			case Top(esize), Bottom(esize):
				fl = esize.relativeTo(size.y);
				available.set(0, 0, available.width, available.height + fl);
			case Right(esize), Left(esize):
				fl = esize.relativeTo(size.x);
				available.set(0, 0, available.width + fl, available.height);
			case Fill:
				fillqueue.push(panel);
		}
	}

	function afterMeasure() 
	{
		var w = available.width > size.x ? available.width : size.x,
			h = available.height > size.y ? available.height : size.y;
		if(fillqueue.length > 0)
		{
			measuredBoundaries.set(0, 0, w, h);
		} else if(available.width > 0 || available.height > 0) {
			measuredBoundaries.set(0, 0, 
				available.width == 0 ? size.x : available.width,
				available.height == 0 ? size.y : available.height);
		}
		available.set(0, 0, w, h);
	}

	override function updatePanel(panel : Panel)
	{
		var fl : Float;
		switch(docks.get(panel).dock)
		{
			case Top(esize):
				fl = esize.relativeTo(size.y);
				panel.frame.set(available.x, available.y, available.width, fl);
				available.set(available.x, available.y + fl, available.width, available.height - fl);
			case Right(esize):
				fl = esize.relativeTo(size.x);
				panel.frame.set(available.x + available.width - fl, available.y, fl, available.height);
				available.set(available.x, available.y, available.width - fl, available.height);
			case Bottom(esize):
				fl = esize.relativeTo(size.y);
				panel.frame.set(available.x + available.height - fl, available.y, available.width, fl);
				available.set(available.x, available.y, available.width, available.height - fl);
			case Left(esize):
				fl = esize.relativeTo(size.x);
				panel.frame.set(available.x, available.y, fl, available.height);
				available.set(available.x + fl, available.y, available.width - fl, available.height);
			case Fill:
		}
	}

	function afterUpdate() 
	{
		if(0 == fillqueue.length) return;
		var w = available.width / fillqueue.length,
			h = available.height,
			x = available.x,
			y = available.y;
		for(i in 0...fillqueue.length)
		{
			var frame = fillqueue[i].frame;
			frame.set(x + w * i, y, w, h);
		}
	}
}

class DockPanel
{
	var dock : DockKind;
	function new()
	{
		dock = Fill;
	}

	public function dockLeft(size : Extent)
	{
		dock = Left(size);
	}

	public function dockRight(size : Extent)
	{
		dock = Right(size);
	}

	public function dockTop(size : Extent)
	{
		dock = Top(size);
	}

	public function dockBottom(size : Extent)
	{
		dock = Bottom(size);
	}

	public function fill()
	{
		dock = Fill;
	}
}

enum DockKind
{
	Top(size : Extent);
	Right(size : Extent);
	Bottom(size : Extent);
	Left(size : Extent);
	Fill;
}