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
import precog.util.fs.*;

class TreeViewModule extends Module
{
    var tree : HtmlTree<precog.util.fs.Node>;
    override public function connect(communicator: Communicator) {
        communicator
            .demand(SystemHtmlPanelGroup)
            .await(communicator.demand(Locale))
            .with(communicator)
            .then(onMessage);
    }

    function onMessage(message: SystemHtmlPanelGroup, locale : Locale, communicator: Communicator)
    {
        var item = new HtmlPanelGroupItem(locale.singular("file system"));
        message.group.addItem(item);
        item.activate();
        var renderer = new BaseHtmlTreeRenderer(16);
        tree = new HtmlTree(item.panel, renderer);
        communicator.consume(function(fss : Array<NamedFileSystem>) {
                fss.map(addTree.bind(communicator, _));
            });
//        createTree(item.panel);
/*
        communicator.request(
            new RequestMetadataChildren("/", "alt"),
            ResponseMetadataChildren)
            .then(function(response : ResponseMetadataChildren) {

            });
*/
        communicator.queueMany([
            // new MenuItem(MenuFile(SubgroupFileLocal), "Open File...", function(){}, 0),
            // new MenuItem(MenuFile(SubgroupFileLocal), "Close", function(){}, 1)
        ]);
    }

    function addTree(communicator : Communicator, nfs : NamedFileSystem)
    {
        var name = nfs.name,
            fs = nfs.fs;
        wireFileSystem(fs);
        communicator.request(
            new RequestMetadataChildren("/", name),
            ResponseMetadataChildren)
            .then(function(response : ResponseMetadataChildren) {
//                trace(response);
                response.children.map(function(child : String) {
                    fs.root.ensureDirectory(response.parent + child);
                });
            });
//        trace(nfs);
    }

    function wireFileSystem(fs : FileSystem)
    {
        var root = tree.addRoot(fs.root);
        fs.on(function(e : NodeAddEvent) {
                var node = e.node;
//                if(node.isDirectory) {
                    root.appendChild(node);
 //               } else {

   //             }
     //           trace(node);
                tree.update();
            });
    }
/*
    function delayedTreeUpdate()
    {

    }
    */

/*
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
    */
}