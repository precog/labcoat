package precog.layout;

import utest.Assert;
import precog.geom.Point;

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
		Assert.isTrue(panel.size.equals(point0));
		Assert.isTrue(panel.position.equals(point0));
	}

	public function testAnchorLayout()
	{
		
	}

	public function testAnchorPanel()
	{
		
	}

	public function testSize()
	{
		
	}
}