package precog.module.config;

import precog.communicator.Communicator;
import precog.communicator.Module;
import thx.translation.Translation;

class LocalizationAdvisorModule extends Module
{
    override public function connect(communicator: Communicator)
    {
    	var cache = new Map<String, Bool>();
    	communicator
    		.demand(Translation)
			.then(function(t : Translation) {
				t.missingKeyCallback = function(domain, key) {
					if(domain == "en-US" || cache.exists(key))
						return;
					cache.set(key, true);
					trace('missing translation "$key" ($domain)');
				};
			});
    }
}