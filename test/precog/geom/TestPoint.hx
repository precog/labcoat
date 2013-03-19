package precog.geom;

using precog.geom.Point;
using precog.geom.IPoint;
using thx.react.IObservable;
import utest.Assert;

class TestPoint 
{
	public function new() { }

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
			point = new Point(0, 0);
		point.addListener(function(point : IPoint) {
			x = point.x;
			y = point.y;
		});
		point.set(1, 2);
		Assert.equals(1, x);
		Assert.equals(2, y);
	}

	public function testEquals()
	{
		Assert.isTrue(new Point(1, 2).equals(new Point(1, 2)));
	}
}