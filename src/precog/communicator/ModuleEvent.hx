package precog.communicator;

class ModuleEvent
{
	public var module(default, null) : Module;
	public function new(module : Module)
	{
		this.module = module;
	}
}

class ModuleConnecting extends ModuleEvent
{
}

class ModuleDisconnecting extends ModuleEvent
{
}

class ModuleConnected extends ModuleEvent
{
}

class ModuleDisconnected extends ModuleEvent
{
}