package precog.util.fs;

class Root extends Directory
{
	function new(filesystem : FileSystem)
	{
		super("/", null);
		this.filesystem = filesystem;
	}

	override function init()
	{
		isFile = false;
		isDirectory = true;
		isRoot = true;
	}

	override public function toString() return "/";
}