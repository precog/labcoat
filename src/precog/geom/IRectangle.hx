package precog.geom;

interface IRectangle
{
	public var x(default, null) : Float;
	public var y(default, null) : Float;
	public var width(default, null) : Float;
	public var height(default, null) : Float;
	public function equals(other : IRectangle) : Bool;
}