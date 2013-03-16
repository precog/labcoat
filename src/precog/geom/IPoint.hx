package precog.geom;

interface IPoint 
{
	public var x(default, null) : Float;
	public var y(default, null) : Float;
	public function equals(other : IPoint) : Bool;
}