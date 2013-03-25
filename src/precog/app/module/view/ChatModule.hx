package precog.app.module.view;

import precog.app.message.ToolsHtmlPanelGroupMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;

using precog.html.JQuerys;

class ChatModule extends Module {

    override public function connect(communicator: Communicator) {
        communicator
            .demand(ToolsHtmlPanelGroupMessage)
            .then(onSystemPanelMessage);
    }

    function onSystemPanelMessage(message: ToolsHtmlPanelGroupMessage)
        message.value.addItem(new HtmlPanelGroupItem("chat"));
}