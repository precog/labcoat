package labcoat.module.view.fstreeview;

import labcoat.message.*;
import labcoat.message.NodeInfo;
import labcoat.message.PrecogRequest;
import labcoat.message.PrecogResponse;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.util.Locale;
using thx.react.Promise;
import precog.html.Bootstrap;
import precog.html.HtmlButton;
import precog.html.Icons;
using thx.core.Strings;

class ActionsModule extends Module
{
    override public function connect(communicator: Communicator) {
        communicator
            .demand(FSTreeViewToolbarHtml)
            .await(communicator.demand(Locale))
            .with(communicator)
            .then(init);
    }

    function init(item : FSTreeViewToolbarHtml, locale : Locale, communicator : Communicator)
    {
        var delete = new HtmlButton(locale.singular("delete"), Icons.trash, Mini, true);
        delete.element.appendTo(item.element);
        delete.enabled = false;
/*
        var create = new HtmlButton("create", Icons.folderClose, Mini, true);
        create.element.appendTo(item.element);
        create.enabled = false;
*/
        var open = new HtmlButton(locale.singular("open"), Icons.folderOpen, Mini, true);
        open.element.appendTo(item.element);
        open.enabled = false;

        var rename = new HtmlButton(locale.singular("rename"), Icons.edit, Mini, true);
        rename.element.appendTo(item.element);
        rename.enabled = false;
/*
        var upload = new HtmlButton("upload", Icons.uploadAlt, Mini, true);
        upload.element.appendTo(item.element);
        upload.enabled = true;
*/
/*
        var download = new HtmlButton("download", Icons.downloadAlt, Mini, true);
        download.element.appendTo(item.element);
        download.enabled = false;
*/

        communicator.on(function(node : NodeSelected) {
            // DELETE
            switch(node.type) {
                case Notebook, Directory if(node.path != "/"):
                    delete.enabled = true;
                    delete.element.get(0).onclick = confirm(
                        locale.format('<p>Are you sure that you want to delete the {0} and all if its contents?</p><p>{0}: <code>{1}</code></p>', [""+node.type, node.path]),
                        function() {
                            delete.enabled = false;
                            communicator.request(new RequestDirectoryDelete(node.path, node.api), ResponseDirectoryDelete)
                                .then(function(res : ResponseDirectoryDelete) {
                                    communicator.queue(new StatusMessage(
                                        locale.format('deleted {0} at "{1}"', [""+node.type, node.path]),
                                        Info));
                                });
                        }
                    );
                case File:
                    delete.enabled = true;
                    delete.element.get(0).onclick = confirm(
                        locale.format('<p>Are you sure that you want to delete the selected file?</p><p>{0}: <code>{1}</code></p>', [""+node.type, node.path]),
                        function() {
                            delete.enabled = false;
                            communicator.request(new RequestFileDelete(node.path, node.api), ResponseFileDelete)
                                .then(function(res : ResponseFileDelete) {
                                     communicator.queue(new StatusMessage(
                                        locale.format('deleted {0} at "{1}"', [""+node.type, node.path]),
                                        Info));
                                });
                        }
                    );
                case _:
                    delete.enabled = false;
            }

            // OPEN
            switch(node.type) {
                case Notebook, File:
                    open.enabled = true;
                    open.element.get(0).onclick = function() {
                        communicator.trigger(new NodeTriggered(node.path, node.type, node.api, node.meta));
                    };
                case _:
                    open.enabled = false;
            }

            function getFileName(s : String)
                return s.rtrim("/").split("/").pop();

            rename.enabled = true;
            rename.element.get(0).onclick = function() {
                var name = getFileName(node.path);
                Dialog.prompt("Please type a new name for the selected item:", name,
                    function(newname : String) {
                        var parent  = node.path.split("/").slice(0, -1).join("/"),
                            newpath = '$parent/$newname';
                        switch(node.type) {
                            case File:
                                communicator.request(new RequestFileMove(node.path, newpath, node.api), ResponseFileMove)
                                    .then(function(res : ResponseFileMove) {
                                        communicator.queue(new StatusMessage(locale.format('renamed "{0}" to "{1}" in "{2}"', [getFileName(res.src), getFileName(res.dst), parent]), Info));
                                    });
                            case Directory:
                                communicator.request(new RequestDirectoryMove(node.path, newpath, node.api), ResponseDirectoryMove)
                                    .then(function(res : ResponseDirectoryMove) {
                                        communicator.queue(new StatusMessage(locale.format('renamed "{0}" to "{1}" in "{2}"', [getFileName(res.src), getFileName(res.dst), parent]), Info));
                                    });
                            case Notebook:
                                communicator.request(new RequestNotebookMove(node.path, newpath, node.api), ResponseNotebookMove)
                                    .then(function(res : ResponseNotebookMove) {
                                        communicator.queue(new StatusMessage(locale.format('renamed "{0}" to "{1}" in "{2}"', [getFileName(res.src), getFileName(res.dst), parent]), Info));
                                    });
                        }
                    },
                    function(newname : String, handler : String -> Void) {
                        var newpath = node.path.split("/").slice(0, -1).concat([newname]).join("/");
                        switch(node.type) {
                            case File:
                                communicator.request(new RequestFileExist(newpath, node.api), ResponseFileExist)
                                    .then(function(res : ResponseFileExist) {
                                        handler(res.exist ? locale.singular("duplicated name, please pick a different one") : null);
                                    });
                            case Notebook, Directory:
                                communicator.request(new RequestDirectoryExist(newpath, node.api), ResponseDirectoryExist)
                                    .then(function(res : ResponseDirectoryExist) {
                                        handler(res.exist ? locale.singular("duplicated name, please pick a different one") : null);
                                    });
                        }
                    });
            };
        });

        communicator.on(function(node : NodeTriggered) {
            switch (node.type) {
                case Notebook:
                    communicator.trigger(new EditorOpenNotebook(node.path, node.api));
                case File:
                    communicator.trigger(new EditorOpenFile(node.path, node.api));
                case _:
                    // should never happen
            }
        });

        communicator.on(function(node : NodeDeselected) {
            rename.enabled = open.enabled = delete.enabled = true;
        });
    }

    static function confirm(message : String, success : Void -> Void)
    {
        return function() {
            Dialog.confirm(message, success);
        };
    }
}