package precog.app.module.view;

import precog.app.message.ToolsHtmlPanelMessage;
import precog.app.message.ToolsHtmlPanelGroupMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;
import precog.geom.Rectangle;
using thx.react.IObservable;
using precog.html.JQuerys;

class ToolsLayoutModule extends Module {

    override public function connect(communicator: Communicator) {
        communicator
            .demand(ToolsHtmlPanelMessage)
            .then(onToolsPanelMessage.bind(communicator));
    }

    function onToolsPanelMessage(communicator : Communicator, msgsys: ToolsHtmlPanelMessage) {
        var panel = msgsys.value,
            rect = new Rectangle();

        panel.panel.rectangle.addListener(rect.updateSize);
        rect.updateSize(panel.panel.rectangle);

        var group = new HtmlPanelGroup(panel.element, rect, Bottom);

        communicator.provide(new ToolsHtmlPanelGroupMessage(group));
    }
}