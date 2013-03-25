package precog.app.module.view;

import precog.app.message.SupportHtmlPanelGroupMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;

using precog.html.JQuerys;

class TutorialModule extends Module {

    override public function connect(communicator: Communicator) {
        communicator
            .demand(SupportHtmlPanelGroupMessage)
            .then(onSystemPanelMessage);
    }

    function onSystemPanelMessage(message: SupportHtmlPanelGroupMessage)
        message.value.addItem(new HtmlPanelGroupItem("tutorial"));
}