package precog.app.module.view;

import precog.app.message.*;
import precog.util.Locale;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;
import precog.html.HtmlPanel;
import precog.html.HtmlTree;
import jQuery.JQuery;

using thx.react.Promise;
using precog.html.JQuerys;

import precog.app.message.PrecogRequest;
import precog.app.message.PrecogResponse;

class TreeViewModule extends Module {

    override public function connect(communicator: Communicator) {
        communicator
            .demand(SystemHtmlPanelGroup)
            .await(communicator.demand(Locale))
            .then(onMessage.bind(communicator));
    }

    function onMessage(communicator: Communicator, message: SystemHtmlPanelGroup, locale : Locale)
    {
    	var item = new HtmlPanelGroupItem(locale.singular("file system"));
        message.group.addItem(item);
        item.activate();
        createTree(item.panel);
        communicator.request(
            new RequestMetadataChildren("/"),
            ResponseMetadataChildren)
            .then(function(response : ResponseMetadataChildren) {

            });
        communicator.queueMany([
            // new MenuItem(MenuFile(SubgroupFileLocal), "Open File...", function(){}, 0),
            // new MenuItem(MenuFile(SubgroupFileLocal), "Close", function(){}, 1)
        ]);
    }

    function createTree(panel : HtmlPanel)
    {
        var renderer = new BaseHtmlTreeRenderer(16),
            tree = new HtmlTree(panel, renderer),
            tot  = 1000;

        var nodes = [tree.addRoot("#root")],
            pick,
            name,
            i = 0;

        while(nodes.length < tot)
        {
            pick = nodes[Math.floor(Math.random() * nodes.length)];
            name = "node " + ++i;
            switch (Math.floor(Math.random() * 6)) {
                case 0:
                    nodes.push(pick.appendChild(name));
                case 1:
                    nodes.push(pick.insertAfter(name));
                case 2:
                    nodes.push(pick.insertBefore(name));
                case 3:
                    nodes.push(pick.prependChild(name));
                case 4:
                    if(pick.hasChildren)
                        pick.collapse();
                case 5:
                    if(pick.collapsed)
                        pick.expand();
            }
        }

        tree.update();
    }
}