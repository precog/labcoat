package precog.geom;

@:access(precog.geom.Point)
class Rectangle 
{
	public var position(default, null) : Point;
	public var size(default, null) : Point;
	public function new(x : Float = 0.0, y : Float = 0.0, width : Float = 0.0, height : Float = 0.0)
	{
		position = new Point(x, y);
		size = new Point(width, height);
	}

	function setSize(width : Float, height : Float)
	{
		if(size.x == width && size.y == height) return;
		size.set(width, height);
	}

	function setPosition(x : Float, y : Float)
	{
		if(position.x == x && position.y == y) return;
		position.set(x, y);
	}

	public function equals(other : Rectangle)
		return position.equals(other.position) && size.equals(other.size);
}

class MutableRectangle extends Rectangle
{
	override public function setSize(width : Float, height : Float)
		super.setSize(width, height);
	override public function setPosition(x : Float, y : Float)
		super.setPosition(x, y);
}