package precog.app.module.config;

import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.app.message.LocalizationMessage;
import thx.culture.Culture;
import thx.translation.Translation;

class LocalizationModule extends Module
{
    override public function connect(communicator: Communicator)
    {
    	// load language and translations from some source
    	var culture = Culture.embed("it-it");

        new thx.react.promise.Http('translation/${culture.name}.json').request()
            .then(function(json) {
                var translation = new Translation(culture),
                    ob = haxe.Json.parse(json);
                translation.addPo2JsonObject(ob);
                communicator
                    .provide(culture)
                    .provide(translation)
                    .provide(new LocalizationMessage(culture, translation));
            });
    }
}