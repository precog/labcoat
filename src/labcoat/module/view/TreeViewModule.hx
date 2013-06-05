package labcoat.module.view;

import labcoat.message.*;
import labcoat.message.NodeInfo;
import precog.util.Locale;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;
import precog.html.HtmlTree;
import precog.html.FSHtmlTreeRenderer;
import jQuery.JQuery;

using thx.react.Promise;
using precog.html.JQuerys;

import labcoat.message.PrecogRequest;
import labcoat.message.PrecogResponse;
import precog.fs.*;
using StringTools;
using thx.core.Strings;

import precog.layout.*;
using thx.react.IObservable;

import labcoat.config.ViewConfig;

class TreeViewModule extends Module
{
    static inline var UI_TREE_NODE = "ui_tree_node";
    static inline var API_CONTEXT = "api_context";

    var tree : HtmlTree<precog.fs.Node>;
    var communicator : Communicator;
    var fss : Map<String, FileSystem>;
    override public function connect(communicator: Communicator) {
        fss = new Map();
        this.communicator = communicator;
        communicator
            .demand(SystemHtmlPanelGroup)
            .await(communicator.demand(Locale))
            .then(init);
    }

    function parentPath(s : String)
    {
        var p = s.split("/");
        if("metadata.json" == p.pop())
            p.pop();
        return p.join("/");
    }

    function extractNodeInfo(node : Node)
    {
        var path = node.toString(),
            meta = node.meta.getAll(),
            type = getNodeType(node),
            api  = node.root.meta.get(API_CONTEXT);
        return {
            path : path,
            type : type,
            api  : api,
            meta : meta
        };
    }

    function isNotebook(node : Node)
    {
        return node.meta.get("type") == "notebook";
    }

    function init(message: SystemHtmlPanelGroup, locale : Locale)
    {
        var item = new HtmlPanelGroupItem(locale.singular("file system"));
        message.group.addItem(item);
        item.activate();
        var renderer = new FSHtmlTreeRenderer(communicator, 16),
            panels = new ToolbarContainers(item);
        tree = new HtmlTree(panels.main, renderer);
        tree.compare = function(a, b) {
            if(a.isDirectory == b.isDirectory && isNotebook(a) == isNotebook(b))
                return a.name.compare(b.name);
            else if(a.isDirectory)
                return -1;
            else if(isNotebook(a) && !b.isDirectory)
                return -1;
            else
                return 1;

        };
        tree.events.select.on(function(tn : TreeNode<Node>) {
            if(null == tn) {
                communicator.trigger(new NodeDeselected());
            } else {
                var info = extractNodeInfo(tn.data);
                communicator.trigger(new NodeSelected(info.path, info.type, info.api, info.meta));
            }
        });
        tree.events.trigger.on(function(tn : TreeNode<Node>) {
            var info = extractNodeInfo(tn.data);
            communicator.trigger(new NodeTriggered(info.path, info.type, info.api, info.meta));
        });
        tree.events.expand.on(function(tn : TreeNode<Node>) {
            var info = extractNodeInfo(tn.data);
            loadDir(info.path, info.api, 2);
        });
        var toolbar = new JQuery('<div class="btn-group context-bar"></div>').appendTo(panels.toolbar.element);

        communicator.provide(new FSTreeViewToolbarHtml(toolbar));

        communicator.consume(function(fss : Array<NamedFileSystem>) {
            fss.map(addTree.bind(communicator, _));
        });


        function ensureFileAt(path : String, api : String)
        {
            var fs   = fss.get(api),
                node = fs.root.pick(path);
            if(null == node) {
                fs.root.createFileAt(path, true);
            }
        }

        function removeNodeAt(path : String, api : String)
        {
            var fs   = fss.get(api),
                node = fs.root.pick(path);
            if(null == node) return;
            if(node.isDirectory)
                cast(node, Directory).removeRecursive();
            else
                node.remove();
        }

        communicator.on(function(res : ResponseFileDelete) {
            removeNodeAt(res.path, res.api);
        });

        communicator.on(function(res : ResponseDirectoryDelete) {
            removeNodeAt(res.path, res.api);
        });

        communicator.on(function(res : ResponseFileCreate) {
            ensureFileAt(res.path, res.api);
        });

        communicator.on(function(res : ResponseFileUpload) {
            ensureFileAt(res.path, res.api);
        });

        communicator.on(function(res : ResponseFileMove) {
            var fs = fss.get(res.api),
                node = fs.root.pick(res.src);
            if(null != node)
                node.remove();
            fs.root.createFileAt(res.dst, true, null == node ? null : node.meta.getAll());
        });

        communicator.on(function(res : ResponseDirectoryMove) {
            var fs = fss.get(res.api),
                node = fs.root.pick(res.src);
            if(null != node)
                cast(node, Directory).removeRecursive();
            fs.root.ensureDirectory(res.dst, null == node ? null : node.meta.getAll());
        });

        communicator.on(function(res : ResponseNotebookMove) {
            var fs = fss.get(res.api),
                node = fs.root.pick(res.src);
            if(null != node)
                cast(node, Directory).removeRecursive();
            var meta = null == node ? null : node.meta.getAll();
            if(null == meta)
            {
                meta = new Map<String, Dynamic>();
            }
            if(!meta.exists("type"))
                meta.set("type", "notebook");
            fs.root.createFileAt(res.dst, true, meta);
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
        fs.root.meta.set(API_CONTEXT, name);
        fss.set(name, fs);
        wireFileSystem(fs);
        loadDir("/", name, 2);
    }

    function getNodeType(node : Node) : NodeType
    {
        return if(node.meta.get("type") == "notebook")
            Notebook;
        else if(node.isFile)
            File;
        else
            Directory;
    }

    function loadDir(path : String, api : String, levels : Int)
    {
        if(levels == 0)
            return;
        var fs = fss.get(api);
        communicator.request(
                new RequestListChildren(path, api),
                ResponseListChildren
            ).then(thx.core.Procedure.ProcedureDef.fromArity1(function(response : ResponseListChildren) {
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
                                loadDir.bind(path + "/", api, levels-1)
                            );
                    }
                });
            }));
    }

    function isHiddenFile(path : String) {
        function filter(segment : String) 
        {
            return segment.startsWith(".") || segment == "temp"; // TODO remove the second condition once dot-prefix is supported
        }
        return path.split("/").filter(filter).length > 0;
    }

    function wireFileSystem(fs : FileSystem)
    {
        var root = tree.addRoot(fs.root);
        fs.root.meta.set(UI_TREE_NODE, root);
        fs.on(function(e : NodeAddEvent) {
            var node = e.node,
                parent = node.parent.meta.get(UI_TREE_NODE);
            if(isHiddenFile(node.toString())) return;
            var tree_node = parent.appendChildOrdered(node);
            if(node.isDirectory && node.level > 0)
            {
                tree_node.collapse();
            }
            node.meta.set(UI_TREE_NODE, tree_node);
            tree.update();
        });

        fs.on(function(e : NodeRemoveEvent) {
            var node = e.node.meta.get(UI_TREE_NODE);
            if(node == null) return; // file/dir that is not mapped to a node in the tree
            e.node.meta.remove(UI_TREE_NODE);
            node.remove();
            tree.select(null);
            tree.update();
        });
    }
}