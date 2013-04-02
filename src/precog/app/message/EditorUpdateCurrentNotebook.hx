package precog.app.message;

import precog.editor.Notebook;

class EditorNotebookUpdate 
{
	public var current(default, null) : Notebook;
	public var all(default, null) : Array<Notebook>;
	public function new(current : Notebook, all : Array<Notebook>)
	{
		this.current = current;
		this.all = all;
	}
}