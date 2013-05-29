package precog.communicator;

import utest.Assert;
import thx.react.Promise;
import labcoat.message.ApplicationHtmlContainer;

class TestCommunicator
{
	public function new() { }

	public function testOnTrigger()
	{
		var comm = new Communicator();
		comm.on(function(msg : String) {
			Assert.equals("Haxe", msg);
		});
		comm.trigger("Haxe");
	}

	public function testDemandProvide()
	{
		var comm = new Communicator();
		comm.demand(String).then(function(s : String) Assert.equals("Haxe", s));
		comm.provide("Haxe");
	}

	public function testRequestRespond()
	{
		var comm = new Communicator();
		comm.request("haxe", String).then(function(s : String) Assert.equals("HAXE", s));
		comm.respond(function(s : String) {
			return Promise.value(s.toUpperCase());
		}, String, String);
	}

	public function testDemandProvideInstance()
	{
		var comm = new Communicator();
		comm.provide(new ApplicationHtmlContainer(null));
		comm.demand(ApplicationHtmlContainer)
			.then(function(o : ApplicationHtmlContainer) {
				Assert.notNull(o);
				Assert.is(o, ApplicationHtmlContainer);
			});
	}
}