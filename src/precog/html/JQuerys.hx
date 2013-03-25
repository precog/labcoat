package precog.html;

import jQuery.JQuery;

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

	public static function cssTransform(o : JQuery, transform : String)
	{
		o.css("-webkit-transform", transform)
		 .css("-moz-transform", transform)
		 .css("-ms-transform", transform)
		 .css("-o-transform", transform)
		 .css("transform", transform);
	}
}