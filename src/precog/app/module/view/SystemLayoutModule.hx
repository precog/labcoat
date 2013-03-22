package precog.app.module.view;

import precog.app.message.HtmlSystemPanelMessage;
import precog.app.message.HtmlApplicationContainerMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanel;
import precog.html.HtmlSwapPanel;
import precog.html.HtmlPanelGroup;
import precog.html.Icons;
import precog.geom.Rectangle;
using thx.react.IObservable;
using thx.react.Promise;

import js.Browser;
import js.JQuery;

using precog.html.JQuerys;

class SystemLayoutModule extends Module {

    override public function connect(communicator: Communicator) {
        communicator
            .demand(HtmlSystemPanelMessage)
            .then(onSystemPanelMessage);
    }

    function onSystemPanelMessage(msgsys: HtmlSystemPanelMessage) {
        var systemPanel = msgsys.value;

        var subs = addSubs(systemPanel, Top, 2);
        subs = addSubs(subs[0].panel, Left, 3);
        subs = addSubs(subs[0].panel, Right, 4);
        addSubs(subs[0].panel, Bottom, 1);
    }

    function addSubs(container : HtmlPanel, position, n)
    {
        var rect = new Rectangle();

        container.panel.rectangle.addListener(rect.updateZeroed);
        rect.updateZeroed(container.panel.rectangle);

        var group = new HtmlPanelGroup(container.element, rect, position),
            items = [];
        for(i in 1...n+1)
        {
            var text  = 'child $i',
                item  = new HtmlPanelGroupItem(text, Icons.ok);
//            item.panel.element.html(text);
            group.addItem(item);
            items.push(item);
            if(i == 1)
                item.activate();
        }
        return items;
    }
}

// TODO
// add ways to control toggle text/icons
// send event to layout to change the size of the pane
// send out activated/deactivated pane
// send out controls to activate/deactivate pane
// set controls vertically
// rotate icon properly