package precog.layout;

using precog.geom.Rectangle;

@:access(precog.layout.Layout)
class Panel 
{
	public var rectangle(default, null) : Rectangle;
	public var parentLayout(default, null) : Layout;
	public function new()
	{
		rectangle = new Rectangle(0, 0, 0, 0);
	}

	private function setLayout(layout : Layout)
	{
		(function(oldParent : Layout) {
			parentLayout = layout;
			if(null != oldParent)
				oldParent.panels.removePanel(this);
		})(parentLayout);
	}

	public function remove()
		setLayout(null);

	public function toString()
		return 'Panel(${rectangle.x}, ${rectangle.y}, ${rectangle.width}, ${rectangle.height}, layout: $parentLayout)';
}