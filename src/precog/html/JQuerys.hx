package precog.html;

import jQuery.JQuery;

class JQuerys 
{
	static var DBLCLICK_DELAY : Int = 300;
	public static function getInnerSize(o : JQuery)
	{
		return {
			width  : o.innerWidth(),
			height : o.innerHeight()
		};
	}

	public static function getOuterSize(o : JQuery)
	{
		return {
			width  : o.outerWidth(),
			height : o.outerHeight()
		};
	}

	public static function cssTransform(o : JQuery, transform : String)
	{
		o.css("-webkit-transform", transform)
		 .css("-moz-transform", transform)
		 .css("-ms-transform", transform)
		 .css("-o-transform", transform)
		 .css("transform", transform);
	}

	public static function clickOrDblClick(o : JQuery, click : Dynamic, dblclick : Dynamic)
	{
		var timer = null,
			count = 0;
		
		o.click(function(e) {
			if(null == timer)
			{
				count = 0;
				timer = haxe.Timer.delay(function() {
					timer.stop();
					timer = null;
					if(count == 1) {
						Reflect.callMethod(o, click, [e]);
					} else {
						Reflect.callMethod(o, dblclick, [e]);
					}
				}, DBLCLICK_DELAY);
			}
			count++;
		});
	}

	static function __init__() 
	{
#if embed_jquery
		haxe.macro.Compiler.includeFile("precog/html/jquery-1.9.1.js");
#end
	}
}