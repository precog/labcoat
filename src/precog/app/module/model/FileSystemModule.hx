package precog.app.module.model;

import precog.communicator.*;
import precog.util.fs.*;
import thx.react.Promise;

class FileSystemModule extends Module
{
	public function new()
	{
		super();		
	}

	override function connect(communicator : Communicator)
	{
		communicator.provideLazy(
			FileSystem,
			function(deferred : Deferred<FileSystem>) {
				deferred.resolve(new FileSystem());
			});
	}
}