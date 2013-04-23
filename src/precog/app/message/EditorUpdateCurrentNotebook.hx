package precog.app.message;

import precog.editor.Notebook;

class EditorNotebookUpdate implements precog.macro.ValueClass
{
	public var current : Notebook;
	public var all : Array<Notebook>;
}