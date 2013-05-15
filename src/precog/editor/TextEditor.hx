package precog.editor;

typedef TextEditor =
{
	public function getValue() : String;
	public function setValue(text : String) : Void;
	public function refresh() : Void;
	public function focus() : Void;
}