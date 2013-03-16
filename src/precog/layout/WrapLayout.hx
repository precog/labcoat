package precog.layout;

using thx.react.IObservable;

class WrapLayout extends Layout 
{
	var items : Map<Panel, WrapItem>;
	public var defaultWidth : Extent;
	public var defaultHeight : Extent;
	public var vertical : Bool;
	public function new(width : Float, height : Float, ?vertical = true)
	{
		super(width, height);
		defaultWidth = 20;
		defaultHeight = 20;
		items = new Map();
		this.vertical = vertical;
		onpanel.remove.addListener(function(panel) {
			items.remove(panel);
		});
	}

	public function addPanel(panel : Panel) : WrapItem
	{
		var item = new WrapItem(defaultWidth, defaultHeight);
		panels.addPanel(panel);
		items.set(panel, item);
		return item;
	}

	override function createUpdateQueue()
	{
		return vertical
			? [panelIteratorFunction(assignToLineVertical), updateVertical]
			: [panelIteratorFunction(assignToLineHorizontal), updateHorizontal];
	}

	var lines : Array<{ max : Float, panels : Array<{ width : Float, panel : Panel }> }>;
	var current : { max : Float, panels : Array<{ width : Float, panel : Panel }> };
	var offset : Float;
	override function resetBoundaries()
	{
		measuredBoundaries.set(Math.NaN, Math.NaN, Math.NaN, Math.NaN);
		current = { max : 0.0, panels : [] };
		lines = [current];
		offset = 0.0;
	}

	function assignToLineHorizontal(panel)
	{
		var item   = items.get(panel),
			width  = item.width.relativeTo(size.x),
			height = item.height.relativeTo(size.y);
		if(offset + width > size.x)
		{
			current = { max : 0.0, panels : [] };
			lines.push(current);
		} else {
			offset += width;
		}
		if(current.max < height)
			current.max = height;
		current.panels.push({ width : width, panel : panel });
	}

	function updateHorizontal()
	{
		var bw = 0.0,
			oy = 0.0;
		for(line in lines)
		{
			var ox = 0.0;
			for(item in line.panels)
			{
				item.panel.frame.set(
					ox,
					oy,
					item.width,
					line.max
				);
				ox += item.width;
			}
			if(bw < ox)
				bw = ox;
			oy += line.max;
		}
		if(bw > 0 || oy > 0)
		{
			measuredBoundaries.set(
				0,
				0,
				bw,
				oy
			);
		}
	}

	function assignToLineVertical(panel)
	{
		var item   = items.get(panel),
			width  = item.width.relativeTo(size.x),
			height = item.height.relativeTo(size.y);
		if(offset + height > size.y)
		{
			current = { max : 0.0, panels : [] };
			lines.push(current);
		} else {
			offset += height;
		}
		if(current.max < width)
			current.max = width;
		current.panels.push({ width : height, panel : panel });
	}

	function updateVertical()
	{
		var bh = 0.0,
			ox = 0.0;
		for(line in lines)
		{
			var oy = 0.0;
			for(item in line.panels)
			{
				item.panel.frame.set(
					ox,
					oy,
					line.max,
					item.width
				);
				oy += item.width;
			}
			if(bh < oy)
				bh = oy;
			ox += line.max;
		}
		if(ox > 0 || bh > 0)
		{
			measuredBoundaries.set(
				0,
				0,
				ox,
				bh
			);
		}
	}
}

class WrapItem 
{
	public var width(default, null)  : Extent;
	public var height(default, null) : Extent;
	public function new(defaultWidth : Extent, defaultHeight : Extent)
	{
		width  = defaultWidth;
		height = defaultHeight;
	}

	public function setWidth(width : Extent)
	{
		this.width = width;
		return this;
	}

	public function setHeight(height : Extent)
	{
		this.height = height;
		return this;
	}
}