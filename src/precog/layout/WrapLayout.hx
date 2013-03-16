package precog.layout;

using thx.react.IObservable;

class WrapLayout extends Layout 
{
	var items : Map<Panel, WrapItem>;
	public var defaultWidth : Extent;
	public var defaultHeight : Extent;
	public var defaultMarginWidth : Extent;
	public var defaultMarginHeight : Extent;
	public var vertical : Bool;
	public function new(width : Float, height : Float, ?vertical = true)
	{
		super(width, height);
		defaultWidth = 20;
		defaultHeight = 20;
		defaultMarginWidth = 0;
		defaultMarginHeight = 0;
		items = new Map();
		this.vertical = vertical;
		onpanel.remove.addListener(function(panel) {
			items.remove(panel);
		});
	}

	public function addPanel(panel : Panel) : WrapItem
	{
		var item = new WrapItem(defaultWidth, defaultHeight, defaultMarginWidth, defaultMarginHeight);
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

	var lines : Array<{ max : Float, margin : Float, panels : Array<{ width : Float, height : Float, margin : Float, panel : Panel }> }>;
	var current : { max : Float, margin : Float, panels : Array<{ width : Float, height : Float, margin : Float, panel : Panel }> };
	var offset : Float;
	override function resetBoundaries()
	{
		measuredBoundaries.set(Math.NaN, Math.NaN, Math.NaN, Math.NaN);
		current = { max : 0.0, margin : 0.0, panels : [] };
		lines = [current];
		offset = 0.0;
	}

	function assignToLineHorizontal(panel)
	{
		var item   = items.get(panel),
			width  = item.width.relativeTo(size.x),
			height = item.height.relativeTo(size.y),
			marginWidth  = item.marginWidth.relativeTo(size.x),
			marginHeight = item.marginHeight.relativeTo(size.y);
		if(offset + width + marginWidth > size.x)
		{
			current = { max : 0.0, margin : 0.0, panels : [] };
			lines.push(current);
		} else {
			offset += width + marginWidth;
		}
		if(current.max + current.margin < height + marginHeight)
		{
			current.max = height > current.max ? height : current.max;
			current.margin = height + marginHeight - current.max;
		}
		current.panels.push({ width : width, height : height, margin : marginWidth, panel : panel });
	}

	function updateHorizontal()
	{
		var bw = 0.0,
			oy = 0.0,
			my = 0.0;
		for(line in lines)
		{
			var ox = 0.0,
				margin = 0.0;
			for(item in line.panels)
			{
				item.panel.frame.set(
					ox,
					oy,
					item.width,
					item.height
				);
				ox += item.width + item.margin;
				margin = item.margin;
			}
			ox -= margin;
			if(bw < ox)
				bw = ox;
			oy += line.max + line.margin;
			my = line.margin;
		}
		oy -= my;
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
			height = item.height.relativeTo(size.y),
			marginWidth  = item.marginWidth.relativeTo(size.x),
			marginHeight = item.marginHeight.relativeTo(size.y);
		if(offset + height + marginHeight > size.y)
		{
			current = { max : 0.0, margin : 0.0, panels : [] };
			lines.push(current);
		} else {
			offset += height + marginHeight;
		}
		if(current.max + current.margin < width + marginWidth)
		{
			current.max = width > current.max ? width : current.max;
			current.margin = width + marginWidth - current.max;
		}
		current.panels.push({ width : width, height : height, margin : marginHeight, panel : panel });
	}

	function updateVertical()
	{
		var bh = 0.0,
			ox = 0.0,
			mx = 0.0;
		for(line in lines)
		{
			var oy = 0.0,
				margin = 0.0;
			for(item in line.panels)
			{
				item.panel.frame.set(
					ox,
					oy,
					item.width,
					item.height
				);
				oy += item.height + item.margin;
				margin = item.margin;
			}
			oy -= margin;
			if(bh < oy)
				bh = oy;
			ox += line.max + line.margin;
			mx = line.margin;
		}
		ox -= mx;
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
	public var marginWidth(default, null) : Extent;
	public var marginHeight(default, null) : Extent;
	public function new(defaultWidth : Extent, defaultHeight : Extent, defaultMarginWidth : Extent, defaultMarginHeight : Extent)
	{
		width  = defaultWidth;
		height = defaultHeight;
		marginWidth  = defaultMarginWidth;
		marginHeight = defaultMarginHeight;
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

	public function setMarginWidth(width : Extent)
	{
		this.marginWidth = width;
		return this;
	}

	public function setMarginHeight(height : Extent)
	{
		this.marginHeight = height;
		return this;
	}
}