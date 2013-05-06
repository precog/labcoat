package precog.app.module.view;

import precog.app.message.*;
import precog.util.Locale;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;
import precog.html.HtmlPanel;
import precog.html.HtmlTree;
import precog.html.FSHtmlTreeRenderer;
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

    function parentPath(s : String)
    {
        var p = s.split("/");
        if("metadata.json" == p.pop())
            p.pop();
trace(s);
trace(p);
        return p.join("/");
    }

    function onMessage(message: SystemHtmlPanelGroup, locale : Locale)
    {
        var item = new HtmlPanelGroupItem(locale.singular("file system"));
        message.group.addItem(item);
        item.activate();
        var renderer = new FSHtmlTreeRenderer(16);
        tree = new HtmlTree(item.panel, renderer);
        tree.events.select.on(function(node : TreeNode<Node>) {
            trace("select ");
        });
        tree.events.trigger.on(function(node : TreeNode<Node>) {
            trace("trigger ");
        });
        communicator.consume(function(fss : Array<NamedFileSystem>) {
                fss.map(addTree.bind(communicator, _));
            });


        function ensureFileAt(path : String, api : String)
        {
            var fs   = fss.get(api),
                node = fs.root.pick(path);
            if(null == node) {
                fs.root.createFileAt(path, true);
                fs.root.walk(path, function(node : Node) {
                    if(node.isFile) return;
                    loadDir(node.toString(), api, 2);
                });
            }
        }

        communicator.on(function(res : ResponseFileCreate) {
trace(parentPath(res.filePath));
            thx.react.promise.Timer.delay(0).then(function()
                loadDir(parentPath(res.filePath), res.api, 1)
            );
//            ensureFileAt(res.filePath, res.api);
        });
        communicator.on(function(res : ResponseFileUpload) {
trace(parentPath(res.filePath));
            thx.react.promise.Timer.delay(0).then(function()
                loadDir(parentPath(res.filePath), res.api, 1)
            );
//            ensureFileAt(res.filePath, res.api);
        });
        communicator.on(function(res : ResponseDirectoryMove) {
            var fs = fss.get(res.api);
            cast(fs.root.pick(res.src), Directory).removeRecursive();
            fs.root.ensureDirectory(res.dst);
            fs.root.walk(res.dst, function(node : Node) {
                if(node.isFile) return;
                loadDir(node.toString(), res.api, 2);
            });
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
        loadDir("/", name, 4);
    }

    function loadDir(path : String, name : String, levels : Int)
    {
        if(levels == 0)
            return;
        var fs = fss.get(name);
        communicator.request(
                new RequestMetadataChildren(path, name),
                ResponseMetadataChildren
            ).then(function(response : ResponseMetadataChildren) {
                // filter out already existing nodes
                // remove nodes that are not present anymore
                response.children.map(function(item) {
                    var path = response.parent + item.name;

                    switch (item.type) {
                        case "file":
                            if(fs.root.existsFile(path)) return;
                        case "directory":
                            if(fs.root.existsDirectory(path)) return;
                    }

                    switch (item.type) {
                        case "file":
                            fs.root.createFileAt(path, true, item.metadata);
                        case "directory" if(item.metadata.get("type") == "notebook"):
                            fs.root.createFileAt(path, true, item.metadata);
                        case "directory":
                            var n = fs.root.ensureDirectory(path, item.metadata);
                            // TODO, removing the timer will break the second load.communicator
                            // Very possible but in thx.react request/respond
                            thx.react.promise.Timer.delay(0).then(
                                loadDir.bind(path + "/", name, levels-1)
                            );
                    }
                });
            });
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

        fs.on(function(e : NodeRemoveEvent) {
            var node = e.node.meta.get(UI_TREE_NODE);
            e.node.meta.remove(UI_TREE_NODE);
            node.remove();
            tree.update();
        });
    }
}