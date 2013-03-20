package precog.html;

import js.JQuery;
import precog.layout.Panel;
import precog.geom.IRectangle;
import precog.geom.IRectangleObservable;
import thx.react.IObserver;
import thx.react.promise.Timer;

class HtmlPanel implements IObserver<IRectangle>
{
	public var element(default, null) : JQuery;
	public var panel(default, null) : Panel;
	public function new(cls : String = "", ?container : JQuery)
	{
		panel = new Panel();
		element = new JQuery('<div class="panel $cls" style="position:absolute"></div>');
		Timer.delay(0).then(element.addClass.bind("animate-all"));
		panel.rectangle.attach(this);
		if(null != container)
			element.appendTo(container);
	}

	public function update(rect : IRectangle)
	{
		element.css({
			top    : rect.y + "px",
			left   : rect.x + "px",
			width  : rect.width + "px",
			height : rect.height + "px"
		});
	}

	public function destroy()
	{
		panel.rectangle.detach(this);
		element.remove();
		panel = null;
		element = null;
	}
}