package precog.app.module.view;

import precog.app.message.MenuItem;
import precog.communicator.Communicator;
import precog.communicator.Module;

class HelpMenuModule extends Module {
    override public function connect(communicator: Communicator) {
        communicator.queueMany([
            // new MenuItem(MenuHelp(SubgroupHelpLookup), "Lookup symbol", function(){}, 0),
            // new MenuItem(MenuHelp(SubgroupHelpQuirrel), "Quirrel tutorial", function(){}, 0),
            // new MenuItem(MenuHelp(SubgroupHelpQuirrel), "Quirrel reference", function(){}, 1),
            // new MenuItem(MenuHelp(SubgroupHelpSupport), "Support forum", function(){}, 0),
            // new MenuItem(MenuHelp(SubgroupHelpSupport), "Support email", function(){}, 1)
        ]);
    }
}
