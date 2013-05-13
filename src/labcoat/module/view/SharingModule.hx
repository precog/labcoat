package labcoat.module.view;

import labcoat.message.ToolsHtmlPanelGroup;
import precog.util.Locale;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;
using thx.react.Promise;
using precog.html.JQuerys;

class SharingModule extends Module {

    override public function connect(communicator: Communicator) {
        communicator
            .demand(ToolsHtmlPanelGroup)
            .await(communicator.demand(Locale))
            .then(onMessage);
    }

    function onMessage(message: ToolsHtmlPanelGroup, locale : Locale)
        message.group.addItem(new HtmlPanelGroupItem(locale.singular("sharing")));
}