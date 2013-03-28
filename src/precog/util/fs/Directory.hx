package precog.util.fs;

@:access(precog.util.fs.Nodes)
class Directory extends Node
{
	public var directories(default, null) : Directories;
	public var files(default, null) : Files;

	public var length(default, null) : Int;

	public function new(name : String, parent : Directory)
	{
		super(name, parent);
		files = new Files(this);
		directories = new Directories(this);
		length = 0;
	}

	override function init()
	{
		isFile = false;
		isDirectory = true;
		isRoot = false;
	}

	override function remove()
	{
		if(length > 0)
			throw "directory is not empty and cannot be removed";
		super.remove();
	}

	public function removeRecursive()
	{
		for(file in files)
			file.remove();
		for(directory in directories)
			directory.removeRecursive();
	}

	public function addNode(node : Node)
	{
		if(node.isRoot) throw "root node cannot be added or removed";
		node.remove();
		var match = ESegment.Literal(node.name);
		if(directories.find(match).length > 0)
			throw 'a directory with the same name already exist: ${node.name}';
		if(files.find(match).length > 0)
			throw 'a file with the same name already exist: ${node.name}';
		node.parent = this;
		node.filesystem = this.filesystem;
		length++;
		if(node.isFile)
			files.add(cast node);
		else if(node.isDirectory)
			directories.add(cast node);
	}

	public function removeNode(node : Node)
	{
		if(node.isRoot) throw "root node cannot be added or removed";
		if((node.isFile && files.remove(cast node)) || (node.isDirectory && directories.remove(cast node))) {
			length--;
			return true;
		} else {
			return false;
		}
	}

	public function nodes() : Array<Node>
	{
		return cast files.list().concat(cast directories.list());
	}

	public function find(segment : Segment) : Array<Node>
	{
		return cast files.find(segment).concat(cast directories.find(segment));
	}

	public function pick(segment : Segment) : Node
	{
		return find(segment)[0];
	}

	public function traverse(path : Path) : Array<Node>
	{
		var dirs = [path.absolute() ? filesystem.root : this],
			segments = path.segments(),
			last = segments.pop(),
			results : Array<Node> = [];
		dirs = traverseImpl(dirs, segments);
		for(dir in dirs)
			results = results.concat(cast dir.directories.find(last)).concat(cast dir.files.find(last));
		return results;
	}

	function traverseImpl(dirs : Array<Directory>, segments : Array<Segment>)
	{
		if(segments.length == 0 || dirs.length == 0)
			return dirs;
		var segment = segments.shift();
		var results = [];
		for(dir in dirs)
			results = results.concat(dir.directories.find(segment));
		return traverseImpl(results, segments);
	}

	public function removeAt(path : Path, ?recursive : Bool = false)
	{
		var list = traverse(path);
		for(item in list)
		{
			if(recursive && item.isDirectory)
				cast(item, Directory).removeRecursive();
			else
				item.remove();
		}
	}

	public function createFileAt(path : Path, ?ensureDirectory : Bool = false) : File
	{
		var name = path.segments().pop().getLiteral();
		var dir = ensureDirectory ? this.ensureDirectory(path) : cast(traverse(path), Directory);
		return new File(name, dir);
	}

	public function ensureDirectory(path : Path) : Directory
	{
		var dir = path.absolute() ? filesystem.root : this,
			segments = path.segments();
		while(segments.length > 0)
		{
			var segment = segments.shift(),
				next = dir.directories.pick(segment);
			if(null == next)
			{
				break;
			}
			dir = next;
		}
		while(segments.length > 0)
		{
			var name = segments.shift().getLiteral();
			dir = new Directory(name, dir);
		}
		return dir;
	}

	override public function toString()
		return (null == parent ? escape(name) : parent.toString() + (parent.isRoot ? "" : "/") + escape(name));
}