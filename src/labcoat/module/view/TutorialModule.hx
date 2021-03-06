package labcoat.module.view;

import labcoat.message.SupportHtmlPanelGroup;
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
            .demand(SupportHtmlPanelGroup)
            .await(communicator.demand(Locale))
            .then(onMessage);
    }

    function onMessage(message: SupportHtmlPanelGroup, locale : Locale)
        message.group.addItem(new HtmlPanelGroupItem(locale.singular("tutorial")));
}