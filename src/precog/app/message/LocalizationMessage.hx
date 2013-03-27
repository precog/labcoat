package precog.app.message;

import thx.culture.Culture;
import thx.translation.ITranslation;

class LocalizationMessage 
{
	public var culture(default, null) : Culture;
	public var translation(default, null) : ITranslation;
	public function new(culture : Culture, translation : ITranslation)
	{
		this.culture = culture;
		this.translation = translation;
	}
}