package precog.communicator;

import precog.communicator.ModuleEvent;

class ModuleManager 
{
	var communicator : Communicator;
	var modules : Array<Module>;
	public function new()
	{
		communicator = new Communicator();
		communicator.provide(this);
		modules = [];
	}

	public function addModule(module : Module)
	{
		modules.push(module);
		communicator.trigger(new ModuleConnecting(module));
		module.connect(communicator);
		communicator.trigger(new ModuleConnected(module));
	}

	public function removeModule(module : Module)
	{
		if(modules.remove(module))
		{
			communicator.trigger(new ModuleDisconnecting(module));
			module.disconnect(communicator);
			communicator.trigger(new ModuleDisconnected(module));
		}
	}
}