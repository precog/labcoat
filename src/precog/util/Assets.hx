package precog.util;

using thx.react.promise.Http;
using thx.react.Promise;
import thx.culture.Culture;
import thx.translation.Translation;
import haxe.Json;

class Assets 
{
	public static function json(path : String) : Promise<Dynamic -> Void>
	{
		// TODO replace HTTP for FS when available (NodeJS, Cordova)
		return new Http(path).request().pipe(function(s : String) {
			return Promise.value(Json.parse(s));
		});
	}

	public static function localization(name : String) : Promise<Culture -> Translation -> Void>
	{
		if(name == "en-US") // no translation required
		{
			var culture = Culture.invariant,
				translation = new Translation(culture);
			return Promise.value2(culture, translation);
		} else {
			return
				json('localization/$name.json')
					.await(json('translation/$name.json'))
					.pipe2(function(ob_culture : Dynamic, ob_translation : Dynamic) : Promise<Culture -> Translation -> Void> {
						var culture = Culture.createFromObject(ob_culture),
							translation = new Translation(culture);
						translation.addPo2JsonObject(ob_translation);
						return Promise.value2(culture, translation);
					});
		}
	}
}