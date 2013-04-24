package precog.app.module.model;

import precog.communicator.*;
import thx.react.Promise;
import precog.api.*;
import precog.app.message.*;
import precog.app.message.PrecogRequest;
import precog.app.message.PrecogResponse;
using thx.core.Strings;

class PrecogModule extends Module
{
	var apis : Map<String, Precog>;
	var configs : Map<String, PrecogConfig>;
	public function new()
	{
		super();
		apis = new Map();
		configs = new Map();
	}

	function setConfig(cont : PrecogNamedConfig)
	{
		if(configs.exists(cont.name))
			throw 'a precog config for ${cont.name} already exists';
		configs.set(cont.name, cont.config);
		apis.set(cont.name, new Precog({
				analyticsService : cont.config.analyticsService,
				apiKey : cont.config.apiKey
			})
		);
	}

	function getDirectoryFromRoot(api : String, path : String)
	{
		var basePath = configs.get(api).basePath,
			segments = [basePath]
				.concat(path.split('/'))
				.filter(function(v) return null != v)
				.map(Strings.trim.bind(_, "/"))
				.filter(function(v) return v != "");
		return segments.length == 0 ? '' : '${segments.join("/")}/';
	}

	override function connect(communicator : Communicator)
	{
		communicator.consume(function(configs : Array<PrecogNamedConfig>) {
				configs.map(setConfig);
			});
		
		communicator.on(function(request : PrecogRequest) {
				communicator.trigger(new Log("request: " + request.description));		
			});
		
		communicator.on(function(response : PrecogResponse) {
				communicator.trigger(new Log("response: " + response.description));		
			});

		communicator.respond(
			function(request : RequestMetadataChildren) : Null<Promise<ResponseMetadataChildren -> Void>> {
				var deferred = new Deferred(),
					api      = apis.get(request.api);
				if(null == api)
					throw 'no api is set for ${request.api}';
				communicator.trigger(request);
				var path = getDirectoryFromRoot(request.api, request.path);
				api.listChildren(path).then(
					function(result) {
						var response = new ResponseMetadataChildren(request.path, result, request);
						deferred.resolve(response);
						communicator.trigger(response);
					},
					function(err) {
						var response = new ResponseError(err, request);
						deferred.reject(response);
						communicator.trigger(response);
					});
				return deferred.promise;
			},
			RequestMetadataChildren,
			ResponseMetadataChildren
		);

		/*
		var api = new Precog({
				analyticsService : 'https://devapi.precog.com'
			}),
			account = { email : "lc0001@precog.com", password : "verysecretpassword" };
		api.describeAccount(account).then(function(info) {
			trace(info);
		});
		*/
	}
}