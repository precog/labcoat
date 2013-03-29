package precog.app.module.view;

import precog.app.message.SystemHtmlPanelGroupMessage;
import precog.app.message.LocalizationMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;
using thx.react.Promise;

using precog.html.JQuerys;

class FileSystemModule extends Module {

    override public function connect(communicator: Communicator) {
        communicator
            .demand(SystemHtmlPanelGroupMessage)
            .await(communicator.demand(LocalizationMessage))
            .then(onMessage);
    }

    function onMessage(message: SystemHtmlPanelGroupMessage, locale : LocalizationMessage)
        message.value.addItem(new HtmlPanelGroupItem(locale.singular("file system")));
}