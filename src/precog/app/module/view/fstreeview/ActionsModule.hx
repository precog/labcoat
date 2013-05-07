package precog.app.module.view.fstreeview;

import precog.app.message.*;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.util.Locale;
using thx.react.Promise;
import precog.html.HtmlButton;
import precog.html.Icons;
/*
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;
import precog.html.HtmlPanel;
import precog.html.HtmlTree;
import precog.html.FSHtmlTreeRenderer;
import jQuery.JQuery;

using precog.html.JQuerys;

import precog.app.message.PrecogRequest;
import precog.app.message.PrecogResponse;
import precog.util.fs.*;
using StringTools;

import precog.layout.*;
using thx.react.IObservable;

import precog.ViewConfig;
*/
class ActionsModule extends Module
{
    override public function connect(communicator: Communicator) {
        communicator
            .demand(FSTreeViewToolbarHtml)
            .await(communicator.demand(Locale))
            .then(init);
    }

    function init(item : FSTreeViewToolbarHtml, locale : Locale)
    {
        var button = new HtmlButton("delete", Icons.trash, Mini, true);
        button.element.appendTo(item.element);

        var button = new HtmlButton("create", Icons.folderClose, Mini, true);
        button.element.appendTo(item.element);

        var button = new HtmlButton("upload", Icons.cloudUpload, Mini, true);
        button.element.appendTo(item.element);
    }
}