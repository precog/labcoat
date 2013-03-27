package precog.app.module.view;

import precog.app.message.ToolsHtmlPanelGroupMessage;
import precog.app.message.LocalizationMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;

using thx.react.Promise;

using precog.html.JQuerys;

class ChatModule extends Module {

    override public function connect(communicator: Communicator) {
        communicator
            .demand(ToolsHtmlPanelGroupMessage)
            .await(communicator.demand(LocalizationMessage))
            .then(onMessage);
    }

    function onMessage(message: ToolsHtmlPanelGroupMessage, locale : LocalizationMessage)
        message.value.addItem(new HtmlPanelGroupItem(locale.translation.singular("chat")));
}