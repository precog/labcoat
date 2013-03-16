import utest.Assert;
import precog.geom.IPoint;
import precog.geom.IRectangle;
import precog.geom.Point;
import precog.geom.Rectangle;

class AssertPoints 
{
	public static function assertEquals(test : IPoint, expected : IPoint, ?info : haxe.PosInfos)
	{
		Assert.isTrue(test.equals(expected), 'expected $expected but was $test', info);
	}
}

class AssertPoints2
{
	public static function assertEquals(test : IPoint, x : Float, y : Float, ?info : haxe.PosInfos)
	{
		AssertPoints.assertEquals(test, new Point(x,y), info);
	}
}

class AssertRectangles 
{
	public static function assertEquals(test : IRectangle, expected : IRectangle, ?info : haxe.PosInfos)
	{
		Assert.isTrue(test.equals(expected), 'expected $expected but was $test', info);
	}
}

class AssertRectangles2
{
	public static function assertEquals(test : IRectangle, x : Float, y : Float, w : Float, h : Float, ?info : haxe.PosInfos)
	{
		AssertRectangles.assertEquals(test, new Rectangle(x,y,w,h), info);
	}
}