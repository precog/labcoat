package precog.app.module.model;

import precog.app.message.*;
import precog.communicator.*;
import thx.react.Promise;

class PrecogAuthModule extends Module
{
	static var CREDENTIALS_KEY = "labcoat2-credentials";
	var store : js.html.Storage;
	var obfuscator : Obfuscator;
	public function new()
	{
		super();
		store = js.Browser.window.sessionStorage;
		obfuscator = new Obfuscator();
	}

	override function connect(communicator : Communicator)
	{
		// TODO
		// load credentials from sessionStorage
		var credentials = loadCredentials();
		if(null == credentials)
			communicator.provide(new RequestPrecogCredentials());
		else
			communicator.queueMany(credentials);
		communicator.consume(function(data : Array<PrecogNamedConfig>) {
			storeCredentials(data);
		});
		communicator.on(function(_ : Logout) {
			clearCredentials();
		});
	}

	function clearCredentials()
	{
		store.removeItem(CREDENTIALS_KEY);
	}

	function storeCredentials(data : Array<PrecogNamedConfig>)
	{
		store.setItem(CREDENTIALS_KEY, encode(data));
	}

	function loadCredentials() : Array<PrecogNamedConfig>
	{
		var s = store.getItem(CREDENTIALS_KEY);
		if(null == s)
			return null;
		else
			return decode(s);
	}

	function encode(a : Array<PrecogNamedConfig>)
	{
		return obfuscator.encode(haxe.Json.stringify(a.map(function(item) {
			return {
				name : item.name,
				analyticsService : item.config.analyticsService,
				apiKey : item.config.apiKey,
				accountId : item.config.accountId
			};
		})));
	}

	function decode(s : String) : Array<PrecogNamedConfig>
	{
		try {
			var obs : Array<ConfigInfo> = haxe.Json.parse(obfuscator.decode(s));
			return obs.map(function(ob) {
				var config = new PrecogConfig(ob.analyticsService, ob.apiKey, ob.accountId);
				return new PrecogNamedConfig(ob.name, config);
			});
		} catch(e : Dynamic) {
			return null;
		}
	}
}

class Obfuscator
{
	var base : haxe.crypto.BaseCode;
	public function new() {
		base = new haxe.crypto.BaseCode(haxe.io.Bytes.ofString("abcdefghijklmnopqrstuvxyzABCDEFGHIJKLMNOPQRSTUVXYZ0123456789+=/*")); // 
	}
	public function encode(s : String)
	{
		return base.encodeString(s);
	}

	public function decode(s : String)
	{
		return base.decodeString(s);
	}
}

typedef ConfigInfo =
{
	name : String,
	analyticsService : String,
	apiKey : String,
	accountId : String
}