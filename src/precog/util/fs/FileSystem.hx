package precog.util.fs;

@:access(precog.util.fs.Root)
class FileSystem 
{
	public var root(default, null) : Root;
	public function new()
	{
		root = new Root(this);
	}
}