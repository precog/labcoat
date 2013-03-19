package precog.geom;

using Asserts;
using precog.geom.Rectangle;
using precog.geom.IRectangle;
using thx.react.IObservable;
import utest.Assert;

class TestRectangle 
{
	public function new() { }

	public function testValues()
	{
		var rect = new Rectangle(1, 2, 3, 4);
		Assert.equals(1, rect.x);
		Assert.equals(2, rect.y);
		Assert.equals(3, rect.width);
		Assert.equals(4, rect.height);
	}

	public function testObservable()
	{
		var x = 0.0,
			y = 0.0,
			width = 0.0,
			height = 0.0,
			rect = new Rectangle(0, 0, 0, 0);
		rect.addListener(function(rect : IRectangle) {
			x = rect.x;
			y = rect.y;
			width = rect.width;
			height = rect.height;
		});
		rect.set(1, 2, 3, 4);
		Assert.equals(1, x);
		Assert.equals(2, y);
		Assert.equals(3, width);
		Assert.equals(4, height);
	}

	public function testEquals()
	{
		Assert.isTrue(new Rectangle(1, 2, 3, 4).equals(new Rectangle(1, 2, 3, 4)));
	}

	public function testAddRectangle()
	{
		new Rectangle(-10, -5, 20, 10)
			.addRectangle(new Rectangle(-30, 15, 20, 10))
			.assertEquals(-30, -5, 40, 30);

		new Rectangle(-10, -5, 20, 100)
			.addRectangle(new Rectangle(30, 15, 20, 10))
			.assertEquals(-10, -5, 60, 100);
	}
}