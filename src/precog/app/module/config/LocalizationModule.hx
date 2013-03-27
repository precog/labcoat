package precog.app.module.config;

import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.app.message.LocalizationMessage;
import thx.culture.Culture;
import thx.translation.Translation;
import precog.util.Assets;

class LocalizationModule extends Module
{
    override public function connect(communicator: Communicator)
    {
    	// load language and translations from some source
        Assets.localization("en-US")
            .then(function(culture : Culture, translation : Translation) {
                communicator
                    .provide(culture)
                    .provide(translation)
                    .provide(new LocalizationMessage(culture, translation));
            });
    }
}