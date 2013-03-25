package precog.app.module.view;

import precog.app.message.SystemHtmlPanelMessage;
import precog.app.message.SystemHtmlPanelGroupMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;
import precog.geom.Rectangle;
using thx.react.IObservable;
using precog.html.JQuerys;

class SystemLayoutModule extends Module {

    override public function connect(communicator: Communicator) {
        communicator
            .demand(SystemHtmlPanelMessage)
            .then(onSystemPanelMessage.bind(communicator));
    }

    function onSystemPanelMessage(communicator : Communicator, msgsys: SystemHtmlPanelMessage) {
        var panel = msgsys.value;

        var rect = new Rectangle();

        panel.panel.rectangle.addListener(rect.updateSize);
        rect.updateSize(panel.panel.rectangle);

        var group = new HtmlPanelGroup(panel.element, rect, Left);

        communicator.provide(new SystemHtmlPanelGroupMessage(group));
    }
}

// TODO
// add ways to control toggle text/icons
// send event to layout to change the size of the pane
// send out activated/deactivated pane
// send out controls to activate/deactivate pane
// set controls vertically
// rotate icon properly