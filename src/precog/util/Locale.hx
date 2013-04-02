package precog.util;

import thx.culture.Culture;
import thx.culture.Format;
import thx.translation.ITranslation;

class Locale 
{
	public var culture(default, null) : Culture;
	var translation : ITranslation;
	public function new(culture : Culture, translation : ITranslation)
	{
		this.culture = culture;
		this.translation = translation;
	}

	public function singular(id : String) : String
		return translation.singular(id);
	public function plural(ids : String, idp : String, quantifier : Int) : String
		return translation.plural(ids, idp, quantifier);
	public function format(pattern : String, params : Array<Dynamic>)
		return Format.format(singular(pattern), params, culture);
}