package precog.app.module.view;

import precog.app.message.SupportHtmlPanelMessage;
import precog.app.message.SupportHtmlPanelGroupMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;
import precog.geom.Rectangle;
using thx.react.IObservable;
using precog.html.JQuerys;

class SupportLayoutModule extends Module {

    override public function connect(communicator: Communicator) {
        communicator
            .demand(SupportHtmlPanelMessage)
            .then(onMessage.bind(communicator));
    }

    function onMessage(communicator : Communicator, msgsys: SupportHtmlPanelMessage) {
        var panel = msgsys.value,
            rect = new Rectangle();

        panel.panel.rectangle.addListener(rect.updateSize);
        rect.updateSize(panel.panel.rectangle);

        var group = new HtmlPanelGroup(panel.element, rect, Right);

        communicator.provide(new SupportHtmlPanelGroupMessage(group));
    }
}