package precog.layout;

import utest.Assert;
import precog.geom.Point;
import precog.geom.Rectangle;
import precog.layout.CanvasLayout;
import precog.layout.Extent;
using Asserts;

class TestCanvasLayout
{
	static var point0 = new Point(0, 0);
	var layout : CanvasLayout;
	var panel  : Panel;
	public function new() { }

	public function setup()
	{
		layout = new CanvasLayout(200, 100);
		panel  = new Panel();
	}

	public function testDefault()
	{
		layout.addPanel(panel);
		layout.update();
		panel.rectangle.assertEquals(0.0,0.0,0.0,0.0);
	}

	public function testAnchors()
	{
		var tests = [
				{
					layout : TopLeft, panel : TopLeft,
					expected : new Rectangle(0, 0, 80, 40)
				}, {
					layout : TopLeft, panel : Center,
					expected : new Rectangle(-40, -20, 80, 40)
				}, {
					layout : TopLeft, panel : BottomRight,
					expected : new Rectangle(-80, -40, 80, 40)
				}, {
					layout : Center, panel : TopLeft,
					expected : new Rectangle(100, 50, 80, 40)
				}, {
					layout : Center, panel : Center,
					expected : new Rectangle(60, 30, 80, 40)
				}, {
					layout : Center, panel : BottomRight,
					expected : new Rectangle(20, 10, 80, 40)
				}, {
					layout : BottomRight, panel : TopLeft,
					expected : new Rectangle(200, 100, 80, 40)
				}, {
					layout : BottomRight, panel : Center,
					expected : new Rectangle(160, 80, 80, 40)
				}, {
					layout : BottomRight, panel : BottomRight,
					expected : new Rectangle(120, 60, 80, 40)
				}, 
			];

		var canv = layout.addPanel(panel).setSize(80, 40);
		for(test in tests)
		{
			canv.setLayoutAnchor(test.layout)
				.setPanelAnchor(test.panel);
			layout.update();
			Assert.isTrue(
				panel.rectangle.equals(test.expected),
				'expected ${test.expected} but is ${panel.rectangle} for $test'
			);
		}

	}

	public function testOffset()
	{
		layout.addPanel(panel)
			.setPanelAnchor(Center)
			.setLayoutAnchor(Center)
			.setOffset(-10, 10)
			.setSize(20, 20);
		layout.update();
		var test = new Rectangle(90, 60, 20, 20);
		Assert.isTrue(
			panel.rectangle.equals(test),
			'expected ${test} but is ${panel.rectangle}'
		);
	}
	public function testSize()
	{
		layout.addPanel(panel)
			.setSize(100, 0.5);
		layout.update();
		var test = new Rectangle(0, 0, 100, 50);
		Assert.isTrue(
			panel.rectangle.equals(test),
			'expected $test but is ${panel.rectangle}'
		);
	}

	public function testBoundaries() 
	{
		layout.addPanel(panel)
			.setSize(10, 10)
			.setOffset(20, 20);
		layout.update();
		layout.boundaries.assertEquals(20.0,20.0,10.0,10.0);

		var panel2 = new Panel();
		layout.addPanel(panel2)
			.setSize(10, 10)
			.setOffset(50, 50);
		layout.update();
		layout.boundaries.assertEquals(20.0,20.0,40.0,40.0);
	}
}