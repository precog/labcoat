package precog.geom;

using precog.geom.Point;
using thx.react.IObservable;
import utest.Assert;
import thx.react.ObserverFunction;

class TestPoint 
{
	public function new()
	{
		
	}

	public function testValues()
	{
		var point = new Point(1, 2);
		Assert.equals(1, point.x);
		Assert.equals(2, point.y);
	}

	public function testObservable()
	{
		var x = 0.0,
			y = 0.0,
			point = new MutablePoint(0, 0);
		point.observable.addListener(function(point : Point) {
			x = point.x;
			y = point.y;
		});
		point.set(1, 2);
		Assert.equals(1, x);
		Assert.equals(2, y);
	}
}