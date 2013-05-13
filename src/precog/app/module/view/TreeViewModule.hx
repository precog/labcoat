package precog.app.module.view;

import precog.app.message.*;
import precog.app.message.NodeInfo;
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

import precog.layout.*;
using thx.react.IObservable;

import precog.ViewConfig;

class TreeViewModule extends Module
{
    static inline var UI_TREE_NODE = "ui_tree_node";
    static inline var API_CONTEXT = "api_context";

    var tree : HtmlTree<precog.util.fs.Node>;
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

    function createContainers(group : HtmlPanelGroupItem) {
        var layout = new DockLayout(group.panel.rectangle.width, group.panel.rectangle.height);
        layout.defaultMargin = ViewConfig.panelMargin;
        group.panel.rectangle.addListener(function(r) {
            layout.rectangle.updateSize(r); //updateSize
            layout.update();
        });

        var toolbar = new HtmlPanel(),
            main = new HtmlPanel();

        group.panel.element.append(toolbar.element);
        group.panel.element.append(main.element);

        layout.addPanel(toolbar).dockTop(ViewConfig.toolbarHeight);
        layout.addPanel(main);
        layout.update();
//        group.panel.rectangle.attach(layout.rectangle);

        return {
            toolbar : toolbar,
            main : main
        };
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

    function init(message: SystemHtmlPanelGroup, locale : Locale)
    {
        var item = new HtmlPanelGroupItem(locale.singular("file system"));
        message.group.addItem(item);
        item.activate();
        var renderer = new FSHtmlTreeRenderer(16),
            panels = createContainers(item);
        tree = new HtmlTree(panels.main, renderer);
        tree.events.select.on(function(tn : TreeNode<Node>) {
            if(null == tn) {
                communicator.trigger(new NodeDeselected());
            } else {
                var info = extractNodeInfo(tn.data);
                switch(info.type) {
                    case File, Notebook:
                        var dirinfo = extractNodeInfo(tn.data.parent);
                        communicator.trigger(new NodeSelected(dirinfo.path, dirinfo.type, dirinfo.api, dirinfo.meta));
                    case _:
                }
                communicator.trigger(new NodeSelected(info.path, info.type, info.api, info.meta));
            }
        });
        tree.events.trigger.on(function(tn : TreeNode<Node>) {
//            trace(node);
            var info = extractNodeInfo(tn.data);
            communicator.trigger(new NodeTriggered(info.path, info.type, info.api, info.meta));
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
/*
                fs.root.walk(path, function(node : Node) {
                    if(node.isFile) return;
                    loadDir(node.toString(), api, 2);
                });
*/
            }
        }

        function removeNodeAt(path : String, api : String)
        {
            var fs   = fss.get(api),
                node = fs.root.pick(path);
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
/*
            thx.react.promise.Timer.delay(0).then(function()
                loadDir(parentPath(res.path), res.api, 1)
            );
*/
            ensureFileAt(res.path, res.api);
        });

        communicator.on(function(res : ResponseFileUpload) {
/*
            thx.react.promise.Timer.delay(0).then(function()
                loadDir(parentPath(res.path), res.api, 1)
            );
*/
            ensureFileAt(res.path, res.api);
        });

        communicator.on(function(res : ResponseFileMove) {
            var fs = fss.get(res.api);
            fs.root.pick(res.src).remove();
            fs.root.createFileAt(res.dst, true);
            /*
            fs.root.walk(res.dst, function(node : Node) {
                if(node.isFile) return;
                loadDir(node.toString(), res.api, 2);
            });
        */
        });

        communicator.on(function(res : ResponseDirectoryMove) {
            var fs = fss.get(res.api);
            cast(fs.root.pick(res.src), Directory).removeRecursive();
            fs.root.ensureDirectory(res.dst);
            /*
            fs.root.walk(res.dst, function(node : Node) {
                if(node.isFile) return;
                loadDir(node.toString(), res.api, 2);
            });
*/
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
        loadDir("/", name, 4);
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
            tree.select(null);
            tree.update();
        });
    }
}
