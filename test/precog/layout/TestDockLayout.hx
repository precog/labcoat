package precog.layout;

import utest.Assert;
import precog.geom.Point;
import precog.geom.Rectangle;
using Asserts;

class TestDockLayout 
{
	var layout : DockLayout;
	var panel : Panel;

	public function new() { }

	public function setup()
	{
		layout = new DockLayout(200, 100);
		panel  = new Panel();
	}

	public function testSimple()
	{
		layout.addPanel(panel).dockLeft(0.2);
		layout.update();

		panel.frame.assertEquals(0,0,40,100);
	}

	public function testComplex()
	{
		var p1 = new Panel(),
			p2 = new Panel(),
			p3 = new Panel(),
			p4 = new Panel(),
			p5 = new Panel();
		layout.addPanel(p1).dockLeft(0.2);
		layout.addPanel(p2).dockRight(40);
		layout.addPanel(p3).dockTop(20);
		layout.addPanel(p4).dockLeft(0.1);
		layout.addPanel(p5);
		layout.update();

		p1.frame.assertEquals(  0,  0,  40, 100);
		p2.frame.assertEquals(160,  0,  40, 100);
		p3.frame.assertEquals( 40,  0, 120,  20);
		p4.frame.assertEquals( 40, 20,  20,  80);
		p5.frame.assertEquals( 60, 20, 100,  80);
	}

	public function testFill()
	{
		layout.addPanel(panel);
		layout.update();
		panel.frame.assertEquals(0,0,200,100);
	}

	public function testFill2()
	{
		var panel2 = new Panel();
		layout.addPanel(panel);
		layout.addPanel(panel2);
		layout.update();
		panel.frame.assertEquals(0,0,100,100);
		panel2.frame.assertEquals(100,0,100,100);
	}

	public function testExceededBoundaries()
	{
		layout.update();
		Assert.isTrue(Math.isNaN(layout.boundaries.width));
		Assert.isTrue(Math.isNaN(layout.boundaries.height));

		var dock = layout.addPanel(panel);
		layout.update();
		layout.boundaries.assertEquals(0, 0, 200, 100);

		dock.dockLeft(50);
		layout.update();
		layout.boundaries.assertEquals(0, 0, 50, 100);
	}
}