package precog.geom;

import thx.react.Suspendable;

class Point extends Suspendable<IPoint> implements IPointObservable
{
	public var x(default, null) : Float;
	public var y(default, null) : Float;
	public function new(x = 0.0, y = 0.0)
	{
		this.x = x;
		this.y = y;
	}

	public function equals(other : IPoint)
		return x == other.x && y == other.y;

	public function toString()
		return 'Point($x, $y)';
		
	public function set(x : Float, y : Float)
	{
		if(this.x == x && this.y == y) return;
		this.x = x;
		this.y = y;
		notify(true);
	}
}