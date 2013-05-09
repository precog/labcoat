package precog.app.module.view;

import precog.app.message.*;
import precog.util.Locale;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanelGroup;

using thx.react.Promise;

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
    	var el = bar.panel.element;

    	var timer = null;
    	function updateRequests()
    	{
    		if(null != timer) timer.stop();
    		timer = haxe.Timer.delay(function(){
	    		if(requests != 0)
	    			el.html('<small><i class="icon-spinner icon-spin"></i> <span class="label label-important"> active requests: $requests</span> out of <span class="label label-light">$total</span></small>');
	    		else
	    			el.html('<small><i class="icon-cloud"></i> <span class="label label-light"> total requests made $total</span></small>');
    		}, 200);
    	}

    	communicator.on(function(req : PrecogRequest) {
    		updateRequests();
    	});

    	communicator.on(function(res : PrecogResponse) {
    		updateRequests();
    	});

    	updateRequests();
    }
}