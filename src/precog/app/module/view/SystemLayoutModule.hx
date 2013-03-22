package precog.app.module.view;

import precog.app.message.HtmlSystemPanelMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanel;

import js.Browser;
import js.JQuery;

using precog.html.JQuerys;

class SystemLayoutModule extends Module {

    override public function connect(communicator: Communicator) {
        communicator.demand(HtmlSystemPanelMessage).then(onSystemPanelMessage);
    }

    function onSystemPanelMessage(message: HtmlSystemPanelMessage) {
        var container = message.value.element;
    }
}
