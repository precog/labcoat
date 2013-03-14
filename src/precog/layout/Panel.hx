package precog.layout;

using precog.geom.Point;

@:access(precog.layout.Layout)
@:access(precog.geom.Point.ObservablePoint.set)
class Panel 
{
	public var position(default, null) : Point;
	public var size    (default, null) : Point;
	public var parentLayout(default, null) : Layout;
	public function new()
	{
		position = new MutablePoint(0, 0);
		size     = new MutablePoint(0, 0);
	}

	private function setLayout(layout : Layout)
	{
		if(null != parentLayout)
			parentLayout.panels.removePanel(this);
		parentLayout = layout;
	}

	public function remove()
		setLayout(null);
}