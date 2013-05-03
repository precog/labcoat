package precog.app.module.view;

import precog.app.message.*;
import precog.util.Locale;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;
import precog.html.HtmlPanel;

using thx.react.Promise;

using precog.html.JQuerys;

class StatusModule extends Module {
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
    	var group = new HtmlPanelGroupItem(locale.singular("status"));
    	group.panel.element.addClass("status");
    	ul = new jQuery.JQuery('<ul class="status-list unstyled"></ul>').appendTo(group.panel.element);
        message.group.addItem(group);
        communicator.consume(function(messages : Array<StatusMessage>) {
        	messages.map(consumeMessage.bind(locale));
        	group.activate();
        	group.panel.element.scrollTop(group.panel.element.get(0).scrollHeight);
        });
    }

    function consumeMessage(locale : Locale, status : StatusMessage) {
    	var type = Std.string(status.type).toLowerCase(),
    		li = new jQuery.JQuery('<li class="text-$type"><i class="icon-${icon(type)}"></i><span class="text"></span><span class="badge time">${locale.format("{0:T}", [status.time])}</span></li>').appendTo(ul);
    	li.find(".text").append(status.message);
    }

    function icon(type : String)
    {
    	return switch(type) {
    		case "error":	"exclamation-sign";
    		case "warning":	"warning-sign";
    		case "info":	"info-sign";
    		case _:			"question-sign";
    	}
    }
}