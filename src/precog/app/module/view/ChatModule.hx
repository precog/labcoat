package precog.app.module.view;

import precog.app.message.RequestToolsHtmlPanelGroupMessage;
import precog.app.message.ToolsHtmlPanelGroupMessage;
import precog.util.Locale;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;

using thx.react.Promise;

using precog.html.JQuerys;

class ChatModule extends Module {

    override public function connect(communicator: Communicator) {
        communicator
            .request(new RequestToolsHtmlPanelGroupMessage(), ToolsHtmlPanelGroupMessage)
            .await(communicator.demand(Locale))
            .then(onMessage);
    }

    function onMessage(message: ToolsHtmlPanelGroupMessage, locale : Locale)
        message.value.addItem(new HtmlPanelGroupItem(locale.singular("chat")));
}