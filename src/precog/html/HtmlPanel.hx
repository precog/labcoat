package precog.html;

import jQuery.JQuery;
import precog.layout.Panel;
import precog.geom.IRectangle;
import precog.geom.IRectangleObservable;
import thx.react.IObserver;
import thx.react.promise.Timer;

class HtmlPanel extends Panel implements IObserver<IRectangle>
{
	public var element(default, null) : JQuery;
	public function new(cls : String = "", ?container : JQuery)
	{
		super();
		element = new JQuery('<div class="panel $cls" style="position:absolute"></div>');
//		Timer.delay(0).then(element.addClass.bind("animate-all"));
		rectangle.attach(this);
		if(null != container)
			element.appendTo(container);
	}

	public function update(rect : IRectangle)
	{
		rectangle.set(rect.x, rect.y, rect.width, rect.height);
		element
                    .css("top",    rect.y + "px")
                    .css("left",   rect.x + "px")
                    .css("width",  rect.width + "px")
                    .css("height", rect.height + "px");
	}

	public function destroy()
	{
		rectangle.detach(this);
		element.remove();
	}
}