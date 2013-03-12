package precog.communicator;

import utest.Assert;
import precog.communicator.ModuleEvent;
import precog.communicator.Module;

class TestModuleManager
{
	public function new() { }

	public function testConnectDisconnect()
	{
		var manager = new ModuleManager(),
			module = new SampleModule();
		Assert.isFalse(module.connected);
		manager.addModule(module);
		Assert.isTrue(module.connected);
		Assert.isFalse(module.disconnected);
		manager.removeModule(module);
		Assert.isTrue(module.disconnected);
	}

	public function testProvideManager()
	{
		var manager = new ModuleManager(),
			module = new SampleModule();
		Assert.isNull(module.manager);
		manager.addModule(module);
		Assert.equals(manager, module.manager);
	}

	public function testModuleEvents()
	{
		var manager = new ModuleManager(),
			module = new SampleModule(),
			monitor = new EventCounterModule(module);
		manager.addModule(monitor);
		Assert.equals(0, monitor.connecting);
		Assert.equals(0, monitor.connected);
		manager.addModule(module);
		Assert.equals(1, monitor.connecting);
		Assert.equals(1, monitor.connected);

		Assert.equals(0, monitor.disconnecting);
		Assert.equals(0, monitor.disconnected);
		manager.removeModule(module);
		Assert.equals(1, monitor.disconnecting);
		Assert.equals(1, monitor.disconnected);
	}
}

class SampleModule extends Module
{
	public var connected : Bool = false;
	public var disconnected : Bool = false;
	public var manager : ModuleManager;
	public function new()  { }

	override public function connect(comm : Communicator)
	{
		connected = true;
		comm.demand(ModuleManager).then(function(m : ModuleManager) {
			this.manager = m;
		});
	}

	override public function disconnect(comm : Communicator)
	{
		disconnected = true;
	}
}

class EventCounterModule extends Module
{
	public var connecting : Int = 0;
	public var connected : Int = 0;
	public var disconnecting : Int = 0;
	public var disconnected : Int = 0;

	public var identity : Module;

	public function new(identity : Module)
	{
		this.identity = identity;
	}

	override public function connect(comm : Communicator)
	{
		comm.on(function(e : ModuleConnecting) {
			connecting++;
			Assert.equals(identity, e.module);
		});
		comm.on(function(e : ModuleConnected) {
			// discard self
			if(e.module == this) return;
			connected++;
			Assert.equals(identity, e.module);
		});
		comm.on(function(e : ModuleDisconnecting) {
			disconnecting++;
			Assert.equals(identity, e.module);
		});
		comm.on(function(e : ModuleDisconnected) {
			disconnected++;
			Assert.equals(identity, e.module);
		});
	}
}