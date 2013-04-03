package precog.app.module.view;

import precog.app.message.RequestSupportHtmlPanelGroupMessage;
import precog.app.message.SupportHtmlPanelGroupMessage;
import precog.util.Locale;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;
using thx.react.Promise;

using precog.html.JQuerys;

class ExamplesModule extends Module {

    override public function connect(communicator: Communicator) {
        communicator
            .request(new RequestSupportHtmlPanelGroupMessage(), SupportHtmlPanelGroupMessage)
            .await(communicator.demand(Locale))
            .then(onMessage);
    }

    function onMessage(message: SupportHtmlPanelGroupMessage, locale : Locale)
        message.value.addItem(new HtmlPanelGroupItem(locale.singular("examples")));
}