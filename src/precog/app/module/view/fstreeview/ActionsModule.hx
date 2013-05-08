package precog.app.module.view.fstreeview;

import precog.app.message.*;
import precog.app.message.NodeInfo;
import precog.app.message.PrecogRequest;
import precog.app.message.PrecogResponse;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.util.Locale;
using thx.react.Promise;
import precog.html.Bootstrap;
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
        var create = new HtmlButton("create", Icons.folderClose, Mini, true);
        create.element.appendTo(item.element);
        create.enabled = false;
*/
        var open = new HtmlButton("open", Icons.folderOpen, Mini, true);
        open.element.appendTo(item.element);
        open.enabled = false;
/*
        var upload = new HtmlButton("upload", Icons.uploadAlt, Mini, true);
        upload.element.appendTo(item.element);
        upload.enabled = false;

        var download = new HtmlButton("download", Icons.downloadAlt, Mini, true);
        download.element.appendTo(item.element);
        download.enabled = false;
*/

        communicator.on(function(node : NodeSelected) {
            // DELETE
            switch(node.type) {
                case Notebook, Directory if(node.path != "/"):
                    delete.enabled = true;
                    delete.element.get(0).onclick = confirm('<p>Are you sure that you want to delete the ${node.type} and all if its contents?</p><p>${node.type}: <code>${node.path}</code></p>', function() {
                        delete.enabled = false;
                        communicator.request(new RequestDirectoryDelete(node.path, node.api), ResponseDirectoryDelete)
                            .then(function(res : ResponseDirectoryDelete) {
                                communicator.queue(new StatusMessage('deleted ${node.type} at ${node.path}', Info));
                            });
                    });
                case File:
                    delete.enabled = true;
                    delete.element.get(0).onclick = confirm('<p>Are you sure that you want to delete the selected file?</p><p>${node.type}: <code>${node.path}</code></p>', function() {
                        delete.enabled = false;
                        communicator.request(new RequestFileDelete(node.path, node.api), ResponseFileDelete)
                            .then(function(res : ResponseFileDelete) {
                                 communicator.queue(new StatusMessage('deleted ${node.type} at ${node.path}', Info));
                            });
                    });
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
            delete.enabled = true;
        });
    }

    static function confirm(message : String, success : Void -> Void)
    {
        return function() {
            Dialog.confirm(message, success);
        };
    }
}