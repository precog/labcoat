package precog.app.module.model;

import precog.communicator.*;
import precog.util.fs.*;

class FileSystemModule extends Module
{
	public function new()
	{
		super();		
	}


	override function connect(communicator : Communicator)
	{
		var fs = new FileSystem();
		communicator.provide(fs);
	}
}