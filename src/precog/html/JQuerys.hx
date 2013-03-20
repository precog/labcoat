package precog.html;

import js.JQuery;

class JQuerys 
{
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
}