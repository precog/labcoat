package precog.app.module.view;

import precog.app.message.SupportHtmlPanelGroupMessage;
import precog.util.Locale;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;

import thx.translation.Translation;
using thx.react.Promise;

using precog.html.JQuerys;

class TutorialModule extends Module {

    override public function connect(communicator: Communicator) {
        communicator
            .demand(SupportHtmlPanelGroupMessage)
            .await(communicator.demand(Locale))
            .then(onMessage);
    }

    function onMessage(message: SupportHtmlPanelGroupMessage, locale : Locale)
        message.value.addItem(new HtmlPanelGroupItem(locale.singular("tutorial")));
}