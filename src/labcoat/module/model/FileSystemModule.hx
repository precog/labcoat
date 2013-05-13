package labcoat.module.model;

import labcoat.message.*;
import precog.communicator.*;
import precog.fs.*;
import thx.react.Promise;

class FileSystemModule extends Module
{
	public function new()
	{
		super();		
	}

	override function connect(communicator : Communicator)
	{
		communicator.consume(function(configs : Array<PrecogNamedConfig>) {
				configs.map(createFileSystem.bind(communicator));
			});
		/*
		communicator.provideLazy(
			FileSystem,
			function(deferred : Deferred<FileSystem>) {
				var fs = new FileSystem();
				deferred.resolve(fs);
			});
*/
	}

	function createFileSystem(communicator : Communicator, config : PrecogNamedConfig)
	{
		var name = config.name,
			fs = new FileSystem();
		communicator.queue(new NamedFileSystem(name, fs));
	}
}