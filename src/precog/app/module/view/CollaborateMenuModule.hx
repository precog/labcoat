package precog.app.module.view;

import precog.app.message.MenuItemMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;

class CollaborateMenuModule extends Module {
    override public function connect(communicator: Communicator) {
        communicator.queueMany([
            // new MenuItemMessage(new MenuItem(MenuCollaborate(SubgroupCollaborateChannels), "Quirrel channel", function(){}, 0)),
            // new MenuItemMessage(new MenuItem(MenuCollaborate(SubgroupCollaborateChannels), "Create channel..", function(){}, 1)),
            // new MenuItemMessage(new MenuItem(MenuCollaborate(SubgroupCollaborateChannels), "Join channel", function(){}, 2)),
            // new MenuItemMessage(new MenuItem(MenuCollaborate(SubgroupCollaborateSharing), "Share file...", function(){}, 0)),
            // new MenuItemMessage(new MenuItem(MenuCollaborate(SubgroupCollaborateSharing), "Manage sharing...", function(){}, 1)),
            // new MenuItemMessage(new MenuItem(MenuCollaborate(SubgroupCollaborateComments), "Add comment...", function(){}, 0))
        ]);
    }
}
