package precog.app.message;

import precog.editor.Notebook;

class EditorNotebookSwitchTo 
{
	public var notebook(default, null) : Notebook;
	public function new(notebook : Notebook)
	{
		this.notebook = notebook;
	}
}