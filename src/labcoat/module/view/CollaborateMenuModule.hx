package labcoat.module.view;

import labcoat.message.MenuItem;
import precog.communicator.Communicator;
import precog.communicator.Module;

class CollaborateMenuModule extends Module {
    override public function connect(communicator: Communicator) {
        communicator.queueMany([
            // new MenuItem(MenuCollaborate(SubgroupCollaborateChannels), "Quirrel channel", function(){}, 0),
            // new MenuItem(MenuCollaborate(SubgroupCollaborateChannels), "Create channel..", function(){}, 1),
            // new MenuItem(MenuCollaborate(SubgroupCollaborateChannels), "Join channel", function(){}, 2),
            // new MenuItem(MenuCollaborate(SubgroupCollaborateSharing), "Share file...", function(){}, 0),
            // new MenuItem(MenuCollaborate(SubgroupCollaborateSharing), "Manage sharing...", function(){}, 1),
            // new MenuItem(MenuCollaborate(SubgroupCollaborateComments), "Add comment...", function(){}, 0)
        ]);
    }
}
