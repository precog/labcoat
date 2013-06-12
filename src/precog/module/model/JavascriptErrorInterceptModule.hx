package precog.module.model;

import precog.communicator.*;
import thx.react.Promise;
import precog.api.*;
import labcoat.message.*;
import thx.react.Buffer;

class JavascriptErrorInterceptModule extends Module
{
	var buffer : Buffer;
	public function new()
	{
		super();
		buffer = new Buffer();
		js.Browser.window.onerror = cast function(msg : String, url : String, line : String) {
trace(untyped arguments);
			var message = '$msg <small>(line $line) at $url</small>';
			buffer.queue(new StatusMessage(message, Error));
		};
	}
	override function connect(communicator : Communicator)
	{
		buffer.consume(function(arr : Array<StatusMessage>) communicator.queueMany(arr));
	}
}