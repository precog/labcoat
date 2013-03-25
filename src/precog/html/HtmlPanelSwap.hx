package precog.html;

import jQuery.JQuery;
import precog.layout.Panel;
import precog.geom.IRectangle;
import precog.geom.IRectangleObservable;
import thx.react.IObserver;
import thx.react.promise.Timer;

class HtmlPanelSwap extends HtmlPanel
{
	public var visible(default, null) : Bool;

	public function new(cls : String = "", ?container : JQuery)
	{
		super(cls, container);
		show();
	}

	public function show()
	{
		if(visible) return;
		visible = true;
		element.show();
	}

	public function hide()
	{
		if(!visible) return;
		visible = false;
		element.hide();
	}
}