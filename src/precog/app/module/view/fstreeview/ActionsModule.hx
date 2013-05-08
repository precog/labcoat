package precog.app.module.view.fstreeview;

import precog.app.message.*;
import precog.app.message.NodeInfo;
import precog.app.message.PrecogRequest;
import precog.app.message.PrecogResponse;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.util.Locale;
using thx.react.Promise;
import precog.html.HtmlButton;
import precog.html.Icons;

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
        var delete = new HtmlButton("delete", Icons.trash, Mini, true);
        delete.element.appendTo(item.element);
        delete.enabled = false;
/*
        var create = new HtmlButton("create", Icons.plusSign, Mini, true);
        create.element.appendTo(item.element);
        create.enabled = false;
*/
        var open = new HtmlButton("open", Icons.folderOpen, Mini, true);
        open.element.appendTo(item.element);
        open.enabled = false;
/*
        var upload = new HtmlButton("upload", Icons.upload, Mini, true);
        upload.element.appendTo(item.element);
        upload.enabled = false;

        var download = new HtmlButton("download", Icons.download, Mini, true);
        download.element.appendTo(item.element);
        download.enabled = false;
*/

        communicator.on(function(node : NodeSelected) {
            if(delete.enabled = isDeletable(node.path, node.type)) {
                delete.element.get(0).onclick = function() {
                    delete.enabled = false;
                    switch(node.type) {
                        case Notebook, Directory:
                            communicator.request(new RequestDirectoryDelete(node.path, node.api), ResponseDirectoryDelete)
                                .then(function(res : ResponseDirectoryDelete) {
                                    communicator.queue(new StatusMessage('deleted ${node.type} at ${node.path}', Info));                                });
                        case File:
                            communicator.request(new RequestFileDelete(node.path, node.api), ResponseFileDelete)
                                .then(function(res : ResponseFileDelete) {
                                     communicator.queue(new StatusMessage('deleted ${node.type} at ${node.path}', Info));
                                });
                    }
                };
            }
        });

        communicator.on(function(node : NodeTriggered) {
            trace(node.toString());
        });

        communicator.on(function(node : NodeDeselected) {
            delete.enabled = true;
        });
    }

    static function isDeletable(path : String, type : NodeType)
        return switch (type) {
            case _: path != "/";
        };
}