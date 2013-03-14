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

	public function testUpdateOnAdd()
	{
		panels.addPanel(new Panel());
		Assert.isTrue(updated);
	}

	public function testUpdateOnRemove()
	{
		var panel = new Panel();
		panels.addPanel(panel);
		updated = false;
		panels.removePanel(panel);
		Assert.isTrue(updated);
	}

	public function testSuspendResume()
	{
		suspend();
		var panel = new Panel();
		panels.addPanel(panel);
		Assert.isFalse(updated);
		panels.removePanel(panel);
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
