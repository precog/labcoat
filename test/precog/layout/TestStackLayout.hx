package precog.layout;

import utest.Assert;
import precog.geom.Point;
import precog.geom.Rectangle;
using Asserts;

class TestStackLayout 
{
	public function new() { }

	public function testHorizontal()
	{
		var layout = new StackLayout(200, 20, false),
			p1 = new Panel(),
			p2 = new Panel(),
			p3 = new Panel();

		layout.defaultExtent = 100;
		layout.addPanel(p1);
		layout.addPanel(p2).setExtent(50);
		layout.addPanel(p3);
		layout.update();

		p1.rectangle.assertEquals(0,0,100,20);
		p2.rectangle.assertEquals(100,0,50,20);
		p3.rectangle.assertEquals(150,0,100,20);

		layout.boundaries.assertEquals(0, 0, 250, 20);
	}

	public function testVertical()
	{
		var layout = new StackLayout(200, 20, true),
			p1 = new Panel(),
			p2 = new Panel(),
			p3 = new Panel();

		layout.defaultExtent = 100;
		layout.addPanel(p1);
		layout.addPanel(p2).setExtent(50);
		layout.addPanel(p3);
		layout.update();

		p1.rectangle.assertEquals(0,0,200,100);
		p2.rectangle.assertEquals(0,100,200,50);
		p3.rectangle.assertEquals(0,150,200,100);

		layout.boundaries.assertEquals(0, 0, 200, 250);
	}

	public function testMargin()
	{
		var layout = new StackLayout(200, 20, false),
			p1 = new Panel(),
			p2 = new Panel(),
			p3 = new Panel();

		layout.defaultExtent = 100;
		layout.addPanel(p1).setMargin(20);
		layout.addPanel(p2).setExtent(50).setMargin(10);
		layout.addPanel(p3).setMargin(5);
		layout.update();

		p1.rectangle.assertEquals(0,0,100,20);
		p2.rectangle.assertEquals(120,0,50,20);
		p3.rectangle.assertEquals(180,0,100,20);

		layout.boundaries.assertEquals(0, 0, 280, 20);
	}
}