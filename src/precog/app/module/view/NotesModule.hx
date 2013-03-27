package precog.app.module.view;

import precog.app.message.SupportHtmlPanelGroupMessage;
import precog.app.message.LocalizationMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;
using thx.react.Promise;

using precog.html.JQuerys;

class NotesModule extends Module {

    override public function connect(communicator: Communicator) {
        communicator
            .demand(SupportHtmlPanelGroupMessage)
            .await(communicator.demand(LocalizationMessage))
            .then(onMessage);
    }

    function onMessage(message: SupportHtmlPanelGroupMessage, locale : LocalizationMessage)
        message.value.addItem(new HtmlPanelGroupItem(locale.singular("my notes")));
}