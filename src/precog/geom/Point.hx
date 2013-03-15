package precog.geom;

import thx.react.IObservable;
import thx.react.IObserver;
import thx.react.Observable;

class Point
{
	public var x(default, null) : Float;
	public var y(default, null) : Float;
	public var observable(get_observable, null) : IObservable<Point>;
	var _observable : Observable<Point>;
	public function new(x = 0.0, y = 0.0)
	{
		this.x = x;
		this.y = y;
	}

	public function equals(other : Point)
		return x == other.x && y == other.y;

	inline function get_observable()
		return null == _observable ? (_observable = new Observable()) : _observable;

	function set(x : Float, y : Float)
	{
		if(this.x == x && this.y == y) return;
		this.x = x;
		this.y = y;
		if(null != _observable)
			_observable.notify(this);
	}

	public function toString()
		return 'Point($x, $y)';
}

class MutablePoint extends Point
{
	override public function set(x : Float, y : Float)
	{
		super.set(x, y);
	}

	override public function toString()
		return 'MutablePoint($x, $y)';
}