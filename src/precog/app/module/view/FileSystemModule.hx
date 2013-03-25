package precog.app.module.view;

import precog.app.message.SystemHtmlPanelGroupMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;

using precog.html.JQuerys;

class FileSystemModule extends Module {

    override public function connect(communicator: Communicator) {
        communicator
            .demand(SystemHtmlPanelGroupMessage)
            .then(onSystemPanelMessage);
    }

    function onSystemPanelMessage(message: SystemHtmlPanelGroupMessage)
        message.value.addItem(new HtmlPanelGroupItem("file system"));
}