package labcoat.module.view;

import labcoat.message.*;
import precog.message.*;
import precog.util.Locale;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;

using thx.react.Promise;

import jQuery.JQuery;
using precog.html.JQuerys;

class StatusbarModule extends Module {

	var requests : Int = 0;
	var total : Int = 0;

    override public function connect(communicator: Communicator) {
		communicator.on(function(req : PrecogRequest) {
    		requests++;
    		total++;
    	});

    	communicator.on(function(res : PrecogResponse) {
    		requests--;
    	});

        communicator
            .demand(MainStatusbarHtmlPanel)
            .await(communicator.demand(Locale))
            .with(communicator)
            .then(onMessage);
    }

    function onMessage(bar: MainStatusbarHtmlPanel, locale : Locale, communicator : Communicator)
    {
        var main    = new JQuery('<div class="pull-left"></div>').appendTo(bar.panel.element),
            context = new JQuery('<div class="pull-right"></div>').appendTo(bar.panel.element);

    	var timer = null;
    	function updateRequests()
    	{
    		if(null != timer) timer.stop();
    		timer = haxe.Timer.delay(function(){
	    		if(requests != 0)
	    			context.html('<small><i class="icon-spinner icon-spin"></i> <span class="label label-important"> $requests active requests</span> out of <span class="label label-light">$total</span></small>');
	    		else
	    			context.html('<small><i class="icon-cloud"></i> <span class="label label-light"> total requests made $total</span></small>');
    		}, 200);
    	}

        communicator.demand(ApplicationVersion).then(thx.core.Procedure.ProcedureDef.fromArity1(function(msg : ApplicationVersion) {
            main.html('<small>v: ${msg.version}</small>');
        }));

    	communicator.on(function(req : PrecogRequest) {
    		updateRequests();
    	});

    	communicator.on(function(res : PrecogResponse) {
    		updateRequests();
    	});

    	updateRequests();
    }
}