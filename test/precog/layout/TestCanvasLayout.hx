package precog.layout;

import utest.Assert;
import precog.geom.Point;
import precog.layout.CanvasLayout;
import precog.layout.Extent;

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
		Assert.isTrue(panel.size.equals(point0));
		Assert.isTrue(panel.position.equals(point0));
	}

	public function testAnchors()
	{
		var tests = [
				{
					layout : TopLeft, panel : TopLeft,
					expected : new Point(0, 0)
				}, {
					layout : TopLeft, panel : Center,
					expected : new Point(-50, -25)
				}, {
					layout : TopLeft, panel : BottomRight,
					expected : new Point(-100, -50)
				}, {
					layout : Center, panel : TopLeft,
					expected : new Point(100, 50)
				}, {
					layout : Center, panel : Center,
					expected : new Point(50, 25)
				}, {
					layout : Center, panel : BottomRight,
					expected : new Point(0, 0)
				}, {
					layout : BottomRight, panel : TopLeft,
					expected : new Point(200, 100)
				}, {
					layout : BottomRight, panel : Center,
					expected : new Point(150, 75)
				}, {
					layout : BottomRight, panel : BottomRight,
					expected : new Point(100, 50)
				}, 
			];

		var canv = layout.addPanel(panel).setSize(100, 50);
		for(test in tests)
		{
			canv.setLayoutAnchor(test.layout)
				.setPanelAnchor(test.panel);
			layout.update();
			Assert.isTrue(
				panel.position.equals(test.expected),
				'expected ${test.expected} but is ${panel.position} for $test'
			);
		}

	}

	public function testOffset()
	{
		layout.addPanel(panel)
			.setSize(20, 20)
			.setPanelAnchor(Center)
			.setLayoutAnchor(Center)
			.setOffset(-10, 10);
		layout.update();
		var test = new Point(80, 50);
		Assert.isTrue(
			panel.position.equals(test),
			'expected ${test} but is ${panel.position} for $test'
		);
	}

	public function testSize()
	{
		layout.addPanel(panel)
			.setSize(100, 0.5);
		layout.update();
		var test = new Point(100, 50);
		Assert.isTrue(panel.size.equals(test), 'expected $test but is ${panel.size}');
	}
}