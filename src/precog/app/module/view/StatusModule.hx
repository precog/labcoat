package precog.app.module.view;

import precog.app.message.*;
import precog.util.Locale;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;

using thx.react.Promise;

using precog.html.JQuerys;

class StatusModule extends Module {
	var group : HtmlPanelGroupItem;
	var ul : jQuery.JQuery;
    override public function connect(communicator: Communicator) {
        communicator
            .demand(ToolsHtmlPanelGroup)
            .await(communicator.demand(Locale))
            .with(communicator)
            .then(init);
    }

    function init(message: ToolsHtmlPanelGroup, locale : Locale, communicator : Communicator)
    {
    	thx.react.promise.Timer.delay(0).then(function() communicator.queue(new StatusMessage("HOOOW")));

    	group = new HtmlPanelGroupItem(locale.singular("status"));
    	ul = new jQuery.JQuery('<ul class="status-list"></ul>').appendTo(group.panel.element);
        message.group.addItem(group);
        communicator.consume(function(messages : Array<StatusMessage>) {
        	messages.map(consumeMessage.bind(locale));
        	group.activate();
        });
    }

    function consumeMessage(locale : Locale, status : StatusMessage) {
    	var li = new jQuery.JQuery('<li class="${status.type}"><span class="text"></span><span class="time">${locale.format("{0:TS}", [status.time])}</span></li>').appendTo(ul);
    	li.find(".text").append(status.message);
    }
}