package labcoat.module.view.fstreeview;

import labcoat.message.*;
import labcoat.message.NodeInfo;
import labcoat.message.PrecogRequest;
import labcoat.message.PrecogResponse;
import js.html.File;
import js.html.FileReader;
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

        var create = new HtmlButton(locale.singular("create directory"), Icons.folderClose, Mini, true);
        create.element.appendTo(item.element);
        create.enabled = false;

        var open = new HtmlButton(locale.singular("open"), Icons.folderOpen, Mini, true);
        open.element.appendTo(item.element);
        open.enabled = false;

        var rename = new HtmlButton(locale.singular("rename"), Icons.edit, Mini, true);
        rename.element.appendTo(item.element);
        rename.enabled = false;

        var upload = new HtmlButton("upload", Icons.uploadAlt, Mini, true);
        upload.element.appendTo(item.element);
        upload.enabled = false;

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
                    delete.element
                        .off("click")
                        .on("click", confirm(
                                locale.format('<p>Are you sure that you want to delete the {0} and all if its contents?</p><p>{0}: <code>{1}</code></p>', [""+node.type, node.path]),
                                function() {
                                    delete.enabled = false;
                                    communicator.request(new RequestDirectoryDelete(node.path, node.api), ResponseDirectoryDelete)
                                        .then(thx.core.Procedure.ProcedureDef.fromArity1(function(res : ResponseDirectoryDelete) {
                                            communicator.queue(new StatusMessage(
                                                locale.format('deleted {0} at "{1}"', [""+node.type, node.path]),
                                                Info));
                                        }));
                                }
                            )
                        );
                case File:
                    delete.enabled = true;
                    delete.element
                        .off("click")
                        .on("click", confirm(
                                locale.format('<p>Are you sure that you want to delete the selected file?</p><p>{0}: <code>{1}</code></p>', [""+node.type, node.path]),
                                function() {
                                    delete.enabled = false;
                                    communicator.request(new RequestFileDelete(node.path, node.api), ResponseFileDelete)
                                        .then(thx.core.Procedure.ProcedureDef.fromArity1(function(res : ResponseFileDelete) {
                                             communicator.queue(new StatusMessage(
                                                locale.format('deleted {0} at "{1}"', [""+node.type, node.path]),
                                                Info));
                                        }));
                                }
                            )
                        );
                case _:
                    delete.enabled = false;
            }

            // OPEN
            switch(node.type) {
                case Notebook, File:
                    open.enabled = true;
                    open.element
                        .off("click")
                        .on("click", function() {
                            communicator.trigger(new NodeTriggered(node.path, node.type, node.api, node.meta));
                        });
                case _:
                    open.enabled = false;
            }

            // RENAME
            function getFileName(s : String)
                return s.rtrim("/").split("/").pop();

            rename.enabled = true;
            rename.element
                .off("click")
                .on("click", function() {
                    var name = getFileName(node.path);
                    Dialog.prompt("Please type a new name for the selected item:", name,
                        function(newname : String) {
                            var parent  = node.path.split("/").slice(0, -1).join("/"),
                                newpath = '$parent/$newname';
                            switch(node.type) {
                                case File:
                                    communicator.request(new RequestFileMove(node.path, newpath, node.api), ResponseFileMove)
                                        .then(thx.core.Procedure.ProcedureDef.fromArity1(function(res : ResponseFileMove) {
                                            communicator.queue(new StatusMessage(locale.format('renamed "{0}" to "{1}" in "{2}"', [getFileName(res.src), getFileName(res.dst), parent]), Info));
                                        }));
                                case Directory:
                                    communicator.request(new RequestDirectoryMove(node.path, newpath, node.api), ResponseDirectoryMove)
                                        .then(thx.core.Procedure.ProcedureDef.fromArity1(function(res : ResponseDirectoryMove) {
                                            communicator.queue(new StatusMessage(locale.format('renamed "{0}" to "{1}" in "{2}"', [getFileName(res.src), getFileName(res.dst), parent]), Info));
                                        }));
                                case Notebook:
                                    communicator.request(new RequestNotebookMove(node.path, newpath, node.api), ResponseNotebookMove)
                                        .then(thx.core.Procedure.ProcedureDef.fromArity1(function(res : ResponseNotebookMove) {
                                            communicator.queue(new StatusMessage(locale.format('renamed "{0}" to "{1}" in "{2}"', [getFileName(res.src), getFileName(res.dst), parent]), Info));
                                        }));
                            }
                        },
                        function(newname : String, handler : String -> Void) {
                            var newpath = node.path.split("/").slice(0, -1).concat([newname]).join("/");
                            switch(node.type) {
                                case File:
                                    communicator.request(new RequestFileExist(newpath, node.api), ResponseFileExist)
                                        .then(thx.core.Procedure.ProcedureDef.fromArity1(function(res : ResponseFileExist) {
                                            handler(res.exist ? locale.singular("duplicated name, please pick a different one") : null);
                                        }));
                                case Notebook, Directory:
                                    communicator.request(new RequestDirectoryExist(newpath, node.api), ResponseDirectoryExist)
                                        .then(thx.core.Procedure.ProcedureDef.fromArity1(function(res : ResponseDirectoryExist) {
                                            handler(res.exist ? locale.singular("duplicated name, please pick a different one") : null);
                                        }));
                            }
                        });
                });

            // UPLOAD
            upload.enabled = switch(node.type) {
                case Directory: true;
                case _: false;
            }
            upload.element
                .off("click")
                .on("click", function() {
                    Dialog.files("Upload file(s):", function(files: Array<File>) {
                        for(file in files) {
                            var reader = new FileReader();
                            reader.onload = function(event: Dynamic) {
                                var type = if(file.type == "") MimeType.fromName(file.name) else file.type;
                                communicator.request(new RequestFileUpload('${node.path}/${file.name}', type, event.target.result), ResponseFileUpload);
                            };
                            reader.readAsBinaryString(file);
                        }
                    });
                });

            // CREATE
            create.enabled = switch(node.type) {
                case Directory if(node.path != "/"): true;
                case _: false;
            }
            create.element
                .off("click")
                .on("click", function() {
                    Dialog.prompt("Create a new folder with name:", null,
                        function(name : String) {
                            var path = '${node.path}/$name';
                            communicator.request(new RequestVirtualDirectoryCreate(path, node.api), ResponseVirtualDirectoryCreate)
                                .then(thx.core.Procedure.ProcedureDef.fromArity1(function(res : ResponseVirtualDirectoryCreate) {
                                    communicator.queue(new StatusMessage(locale.format('created directory "{0}"', [res.path]), Info));
                                }));
                        },
                        function(name : String, handler : String -> Void) {
                            var path = '${node.path}/$name';
                            communicator.request(new RequestDirectoryExist(path, node.api), ResponseDirectoryExist)
                                .then(thx.core.Procedure.ProcedureDef.fromArity1(function(res : ResponseDirectoryExist) {
                                    handler(res.exist ? locale.singular("duplicated name, please pick a different one") : null);
                                }));
                        });
                });
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
            rename.enabled = open.enabled = delete.enabled = false;
        });
    }

    static function confirm(message : String, success : Void -> Void)
    {
        return function() {
            Dialog.confirm(message, success);
        };
    }
}
