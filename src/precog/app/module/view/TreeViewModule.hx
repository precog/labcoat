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
using StringTools;

class TreeViewModule extends Module
{
    static inline var UI_TREE_NODE = "ui_tree_node";

    var tree : HtmlTree<precog.util.fs.Node>;
    var communicator : Communicator;
    var fss : Map<String, FileSystem>;
    override public function connect(communicator: Communicator) {
        fss = new Map();
        this.communicator = communicator;
        communicator
            .demand(SystemHtmlPanelGroup)
            .await(communicator.demand(Locale))
            .then(onMessage);
    }

    function onMessage(message: SystemHtmlPanelGroup, locale : Locale)
    {
        var item = new HtmlPanelGroupItem(locale.singular("file system"));
        message.group.addItem(item);
        item.activate();
        var renderer = new BaseHtmlTreeRenderer(16);
        tree = new HtmlTree(item.panel, renderer);
        communicator.consume(function(fss : Array<NamedFileSystem>) {
                fss.map(addTree.bind(communicator, _));
            });
        communicator.queueMany([
                // new MenuItem(MenuFile(SubgroupFileLocal), "Open File...", function(){}, 0),
                // new MenuItem(MenuFile(SubgroupFileLocal), "Close", function(){}, 1)
            ]);
    }

    function addTree(communicator : Communicator, nfs : NamedFileSystem)
    {
        var name = nfs.name,
            fs = nfs.fs;
        fss.set(name, fs);
        wireFileSystem(fs);
        loadDir("/", name, 2);
    }

    function loadDir(path : String, name : String, levels : Int)
    {
        if(levels == 0)
            return;
        var fs = fss.get(name);
        communicator.request(
            new RequestMetadataPath(path, name),
            ResponseMetadataPath)
            .then(function(response : ResponseMetadataPath) {
                response.children.map(function(child) {
//trace(child);
                    var subpath = response.path + child.name,
                        node : Node = null;
//trace(subpath + " " + child.type);
                    switch (child.type) {
                        case "file":
                            node = fs.root.createFileAt(subpath);
                        case "directory":
                            node = fs.root.ensureDirectory(subpath);
                            thx.react.promise.Timer.delay(0).then(
                                loadDir.bind(subpath, name, levels-1)
                            );
                    }
//                    node.meta.set(UI_TREE_NODE, 
//trace(subpath);
                });

/*
                response.children.map(function(child : String) {
                    var subpath = response.parent + child;
                    communicator.request(
                        new RequestMetadataPath(subpath, name),
                        ResponseMetadataPath)
                        .then(function(response : ResponseMetadataPath) {
trace(response);
                        });
                });
*/
            })
            ;
    }

    function wireFileSystem(fs : FileSystem)
    {
        var root = tree.addRoot(fs.root);
        fs.root.meta.set(UI_TREE_NODE, root);
        fs.on(function(e : NodeAddEvent) {
            var node = e.node,
                parent = node.parent.meta.get(UI_TREE_NODE),
                tree_node = parent.appendChild(node);
                node.meta.set(UI_TREE_NODE, tree_node);
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