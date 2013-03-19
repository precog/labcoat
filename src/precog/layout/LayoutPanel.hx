package precog.layout;

class LayoutPanel extends Panel 
{
	var layout : Layout;
	public function new(layout : Layout)
	{
		super();
		this.layout = layout;
	}
}