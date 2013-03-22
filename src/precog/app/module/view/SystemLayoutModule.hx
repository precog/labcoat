package precog.app.module.view;

import precog.app.message.HtmlSystemPanelMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanel;
import precog.html.HtmlSwapPanel;
import precog.html.HtmlPanelGroup;
using thx.react.IObservable;

import js.Browser;
import js.JQuery;

using precog.html.JQuerys;

class SystemLayoutModule extends Module {

    override public function connect(communicator: Communicator) {
        communicator.demand(HtmlSystemPanelMessage).then(onSystemPanelMessage);
    }

    function onSystemPanelMessage(message: HtmlSystemPanelMessage) {
        var systemPanel = message.value;
        var container = new HtmlPanel();
        container.element.appendTo(systemPanel.element);
        systemPanel.panel.rectangle.addListener(function(rect) {
            container.panel.rectangle.set(0, 0, rect.width, rect.height);
        });

        container.panel.rectangle.set(0, 0, systemPanel.panel.rectangle.width, systemPanel.panel.rectangle.height);

        var group = new HtmlPanelGroup(container, Top);

        var child1 = new HtmlSwapPanel();
        child1.element.html("child 1");
        var child2 = new HtmlSwapPanel();
        child2.element.html("child 2");

        var c1 = new HtmlPanelGroupItem(child1),
            c2 = new HtmlPanelGroupItem(child2);

        group.addItem(c1);
        group.addItem(c2);

        c1.activate();
    }
}
