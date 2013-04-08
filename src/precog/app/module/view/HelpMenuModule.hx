package precog.app.module.view;

import precog.app.message.MenuItemMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;

class HelpMenuModule extends Module {
    override public function connect(communicator: Communicator) {
        communicator.queueMany([
            new MenuItemMessage(new MenuItem(MenuHelp(SubgroupHelpLookup), "Lookup symbol", function(_){}, 0)),
            new MenuItemMessage(new MenuItem(MenuHelp(SubgroupHelpQuirrel), "Quirrel tutorial", function(_){}, 0)),
            new MenuItemMessage(new MenuItem(MenuHelp(SubgroupHelpQuirrel), "Quirrel reference", function(_){}, 1)),
            new MenuItemMessage(new MenuItem(MenuHelp(SubgroupHelpSupport), "Support forum", function(_){}, 0)),
            new MenuItemMessage(new MenuItem(MenuHelp(SubgroupHelpSupport), "Support email", function(_){}, 1))
        ]);
    }
}
