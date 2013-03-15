package precog.layout;

using thx.react.IObservable;

@:access(precog.geom.Point)
class CanvasLayout extends Layout
{
	var canvases : Map<Panel, CanvasPanel>;
	public function new(width : Float, height : Float)
	{
		super(width, height);
		canvases = new Map();
		onpanel.remove.addListener(function(panel) {
			canvases.remove(panel);
		});
	}

	public function addPanel(panel : Panel) : CanvasPanel
	{
		var canvaspanel = new CanvasPanel();
		panels.addPanel(panel);
		canvases.set(panel, canvaspanel);
		return canvaspanel;
	}

	override function updatePanel(panel)
	{
		var c = canvases.get(panel);
		panel.size.set(
			c.width.relativeTo(size.x),
			c.height.relativeTo(size.y)
		);
		panel.position.set(
			c.x.relativeTo(size.x) + anchorX(c.layoutAnchor, size.x) - anchorX(c.panelAnchor, panel.size.x),
			c.y.relativeTo(size.y) + anchorY(c.layoutAnchor, size.y) - anchorY(c.panelAnchor, panel.size.y)
		);
	}

	static function anchorX(anchor : CanvasAnchor, width : Float)
	{
		return switch (anchor) {
			case TopLeft, Left, BottomLeft:
				0.0;
			case Top, Center, Bottom:
				width / 2;
			case TopRight, Right, BottomRight:
				width;
		}
	}

	static function anchorY(anchor : CanvasAnchor, height : Float)
	{
		return switch (anchor) {
			case TopLeft, Top, TopRight:
				0.0;
			case Left, Center, Right:
				height / 2;
			case BottomLeft, Bottom, BottomRight:
				height;
		}
	}
}

class CanvasPanel
{
	public var layoutAnchor(default, null) : CanvasAnchor;
	public var panelAnchor(default, null) : CanvasAnchor;
	public var width(default, null) : Extent;
	public var height(default, null) : Extent;
	public var x(default, null) : Extent;
	public var y(default, null) : Extent;
	public function new()
	{
		this.layoutAnchor = TopLeft;
		this.panelAnchor = TopLeft;
		this.width = 0;
		this.height = 0;
		this.x = 0;
		this.y = 0;
	}

	public function setLayoutAnchor(anchor : CanvasAnchor)
	{
		this.layoutAnchor = anchor;
		return this;
	}

	public function setPanelAnchor(anchor : CanvasAnchor)
	{
		this.panelAnchor = anchor;
		return this;
	}

	public function setSize(width : Extent, height : Extent)
	{
		this.width = width;
		this.height = height;
		return this;
	}

	public function setOffset(x : Extent, y : Extent)
	{
		this.x = x;
		this.y = y;
		return this;
	}
}

enum CanvasAnchor
{
	Center;
	TopLeft;
	Top;
	TopRight;
	Left;
	Right;
	BottomLeft;
	Bottom;
	BottomRight;
}