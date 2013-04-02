package precog.app.message;

import precog.editor.Region;

class EditorRegionRequestCreate 
{
	public var region(default, null) : Region;
	public function new(region : Region)
	{
		this.region = region;
	}
}