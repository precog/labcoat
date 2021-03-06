package precog.layout;

import utest.Assert;

class TestLayout extends Layout
{
	public function new() {
		super(200, 100);
	}

	public function testAddRemovePanel()
	{
		var layout = this,
			panel = new Panel();
		Assert.isFalse(layout.iterator().hasNext());
		layout.panels.addPanel(panel);
		Assert.isTrue(layout.iterator().hasNext());
		layout.panels.removePanel(panel);
		Assert.isFalse(layout.iterator().hasNext());
	}

	public function testUpdate()
	{
		panels.addPanel(new Panel());
		Assert.isFalse(updated);
		update();
		Assert.isTrue(updated);
	}

	public function setup()
	{
		updated = false;
	}

	public function teardown()
	{
		panels.clear();
	}

	var updated : Bool;
	override function updatePanel(panel : Panel)
	{
		updated = true;
	}
}
