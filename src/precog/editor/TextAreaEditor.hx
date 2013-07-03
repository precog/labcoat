package precog.editor;

import jQuery.JQuery;

class TextAreaEditor
{
	public var element(default, null) : JQuery;
	public function new()
	{
		element = new JQuery('<textarea class="textarea-editor editor"></textarea>');
		autoresize(element);
	}
	public function getValue() : String
	{
		return element.val();
	}
	public function setValue(text : String) 
	{
		element.val(text);
	}
	public function refresh() : Void
	{

	}
	public function focus() : Void
	{
		element.focus();
	}
	public function getWrapperElement() : js.html.Element;
	{
		return element.get(0);
	}

	static function autoresize(element : JQuery)
	{
		var t = element.get(0);
		untyped __js__("var offset= !window.opera ? (t.offsetHeight - t.clientHeight) : (t.offsetHeight + parseInt(window.getComputedStyle(t, null).getPropertyValue('border-top-width'))) ;
    var resize  = function(t) {
        t.style.height = 'auto';
        t.style.height = (t.scrollHeight  + offset ) + 'px';    
    }
 
    t.addEventListener && t.addEventListener('input', function(event) {
        resize(t);
    });
 
    t['attachEvent']  && t.attachEvent('onkeyup', function() {
        resize(t);
    });");
	}
}