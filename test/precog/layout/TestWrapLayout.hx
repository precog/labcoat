package precog.layout;

import utest.Assert;
import precog.geom.Point;
import precog.geom.Rectangle;
using Asserts;

class TestWrapLayout 
{
	public function new() { }

	public function testHorizontal()
	{
		var layout = new WrapLayout(200, 20, false),
			p1 = new Panel(),
			p2 = new Panel(),
			p3 = new Panel();

		layout.defaultWidth  = 120;
		layout.defaultHeight = 50;
		layout.addPanel(p1);
		layout.addPanel(p2).setWidth(50).setHeight(200);
		layout.addPanel(p3);
		layout.update();

		p1.rectangle.assertEquals(0,0,120,50);
		p2.rectangle.assertEquals(120,0,50,200);
		p3.rectangle.assertEquals(0,200,120,50);

		layout.boundaries.assertEquals(0, 0, 170, 250);
	}

	public function testVertical()
	{
		var layout = new WrapLayout(200, 100, true),
			p1 = new Panel(),
			p2 = new Panel(),
			p3 = new Panel();

		layout.defaultWidth  = 30;
		layout.defaultHeight = 30;
		layout.addPanel(p1);
		layout.addPanel(p2).setWidth(100).setHeight(40);
		layout.addPanel(p3);
		layout.update();

		p1.rectangle.assertEquals(0,0,30,30);
		p2.rectangle.assertEquals(0,30,100,40);
		p3.rectangle.assertEquals(0,70,30,30);

		layout.boundaries.assertEquals(0, 0, 100, 100);
	}

	public function testMargin()
	{
		var layout = new WrapLayout(200, 20, false),
			p1 = new Panel(),
			p2 = new Panel(),
			p3 = new Panel();

		layout.defaultWidth  = 120;
		layout.defaultHeight = 50;
		layout.addPanel(p1).setMarginWidth(10).setMarginHeight(20);
		layout.addPanel(p2).setWidth(50).setHeight(200).setMarginHeight(5);
		layout.addPanel(p3).setMarginWidth(20).setMarginHeight(10);
		layout.update();

		p1.rectangle.assertEquals(0,0,120,50);
		p2.rectangle.assertEquals(130,0,50,200);
		p3.rectangle.assertEquals(0,205,120,50);

		layout.boundaries.assertEquals(0, 0, 180, 255);
	}
}