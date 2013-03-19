package precog.layout;

using thx.react.IObservable;

/**
TODO:
	- add right-to-left
	- add bottom-to-top
*/
class StackLayout extends Layout 
{
	var items : Map<Panel, StackItem>;
	public var defaultExtent : Extent;
	public var defaultMargin : Extent;
	public var vertical : Bool;
	public function new(width : Float, height : Float, ?vertical = true)
	{
		super(width, height);
		defaultExtent = 20;
		defaultMargin = 0;
		items = new Map();
		this.vertical = vertical;
		onpanel.remove.addListener(function(panel) {
			items.remove(panel);
		});
	}

	public function addPanel(panel : Panel) : StackItem
	{
		var item = new StackItem(defaultExtent, defaultMargin);
		panels.addPanel(panel);
		items.set(panel, item);
		return item;
	}

	override function createUpdateQueue()
	{
		return vertical
			? [panelIteratorFunction(updatePanelVertical)]
			: [panelIteratorFunction(updatePanelHorizontal)];
	}

	var offset : Float;
	override function resetBoundaries()
	{
		measuredBoundaries.set(Math.NaN, Math.NaN, Math.NaN, Math.NaN);
		offset = 0.0;
	}

	function updatePanelVertical(panel)
	{
		var item = items.get(panel),
			height = item.extent.relativeTo(size.y);
		panel.frame.set(
			0,
			offset,
			size.x,
			height
		);
		offset += height;
		if(Math.isNaN(measuredBoundaries.x)) {
			measuredBoundaries.set(
				0,
				0,
				size.x,
				height
			);
		} else {
			measuredBoundaries.set(
				measuredBoundaries.x,
				measuredBoundaries.y,
				measuredBoundaries.width,
				offset
			);
		}
		offset += item.margin.relativeTo(size.y);
	}

	function updatePanelHorizontal(panel)
	{
		var item = items.get(panel),
			width = item.extent.relativeTo(size.x);
		panel.frame.set(
			offset,
			0,
			width,
			size.y
		);
		offset += width;
		if(Math.isNaN(measuredBoundaries.x)) {
			measuredBoundaries.set(
				0,
				0,
				width,
				size.y
			);
		} else {
			measuredBoundaries.set(
				measuredBoundaries.x,
				measuredBoundaries.y,
				offset,
				measuredBoundaries.height
			);
		}
		offset += item.margin.relativeTo(size.x);
	}
}

class StackItem 
{
	public var extent(default, null) : Extent;
	public var margin(default, null) : Extent;
	public function new(defaultExtent : Extent, defaultMargin : Extent)
	{
		extent = defaultExtent;
		margin = defaultMargin;
	}

	public function setExtent(extent : Extent)
	{
		this.extent = extent;
		return this;
	}

	public function setMargin(margin : Extent)
	{
		this.margin = margin;
		return this;
	}
}