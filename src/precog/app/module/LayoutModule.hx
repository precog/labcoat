package precog.app.module;

import precog.communicator.*;
import js.html.Element;

class LayoutModule extends Module
{
	var container : Element;
	public function new(container)
	{
		this.container = container;
	}

	override public function connect(comm : Communicator)
	{
		trace("we are live");
	}

	override public function disconnect(comm : Communicator)
	{

	}
}