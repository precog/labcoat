package precog.app.message;

import precog.editor.Editor;

class EditorUpdate
{
	public var current(default, null) : Editor;
	public var all(default, null) : Array<Editor>;
	public function new(current : Editor, all : Array<Editor>)
	{
		this.current = current;
		this.all = all;
	}
}