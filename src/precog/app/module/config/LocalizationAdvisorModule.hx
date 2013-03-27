package precog.app.module.config;

import precog.communicator.Communicator;
import precog.communicator.Module;
import thx.translation.Translation;

class LocalizationAdvisorModule extends Module
{
    override public function connect(communicator: Communicator)
    {
    	communicator
    		.demand(Translation)
			.then(function(t : Translation) {
				t.missingKeyCallback = function(domain, key) {
					trace('missing translation "$key" ($domain)');
				};
			});
    }
}