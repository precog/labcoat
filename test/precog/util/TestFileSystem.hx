package precog.util;

import utest.Assert;
import precog.util.FileSystem;

class TestFileSystem 
{
	public function new() { }

	var fs : FileSystem;
	public function setup()
	{
		fs = new FileSystem();
	}

	public function testAddRemoveFile()
	{
		var file = new File("sample", fs.root);
		Assert.equals(file, fs.root.files()[0]);
		fs.root.remove(file);
		Assert.equals(0, fs.root.files().length);
	}

	public function testAddRemoveDirectory()
	{
		var dir = new Directory("sample", fs.root);
		Assert.equals(dir, fs.root.directories()[0]);
		fs.root.remove(dir);
		Assert.equals(0, fs.root.directories().length);
	}

	public function testPath()
	{
		var dir = new Directory("dir", fs.root),
			file = new File("file.ext", dir);
		Assert.equals("/", fs.root.toString());
		Assert.equals("/dir", dir.toString());
		Assert.equals("/dir/file.ext", file.toString());
	}

	public function testCount()
	{
		Assert.equals(0, fs.root.length);
		Assert.equals(0, fs.root.directoriesLength);
		Assert.equals(0, fs.root.filesLength);
		// count directories
		new Directory("dir", fs.root);
		Assert.equals(1, fs.root.length);
		Assert.equals(1, fs.root.directoriesLength);
		Assert.equals(0, fs.root.filesLength);
		// count files
		new File("file.ext", fs.root);
		Assert.equals(2, fs.root.length);
		Assert.equals(1, fs.root.directoriesLength);
		Assert.equals(1, fs.root.filesLength);
	}

	public function testPathWithSlash()
	{
		var dir = new Directory("di/r", fs.root),
			file = new File("fil/e.ext", dir);
		Assert.equals("/", fs.root.toString());
		Assert.equals("/di\\/r", dir.toString());
		Assert.equals("/di\\/r/fil\\/e.ext", file.toString());

	}

	public function testMoveNodeInTheSameFilesystem()
	{
		var dir1 = new Directory("dir1", fs.root),
			dir2 = new Directory("dir2", fs.root),
			file = new File("file.ext", dir1);
		Assert.equals("/dir1/file.ext", file.toString());
		dir2.add(file);
		Assert.equals("/dir2/file.ext", file.toString());
		Assert.equals(0, dir1.files().length);
		Assert.equals(1, dir2.files().length);
	}

	public function testMoveNodeToAnotherSameFilesystem()
	{
		var file = new File("file.ext", fs.root);
		Assert.equals(1, fs.root.files().length);
		Assert.equals(fs, file.filesystem);
		Assert.equals(fs.root, file.parent);

		var fs2 = new FileSystem();
		fs2.root.add(file);
		Assert.equals(fs2, file.filesystem);
		Assert.equals(fs2.root, file.parent);
		Assert.equals(0, fs.root.files().length);
		Assert.equals(1, fs2.root.files().length);
	}

	public function testRename()
	{
		var file = new File("file.ext", fs.root);
		Assert.equals("file.ext", file.name);
		file.name = "other.ext";
		Assert.equals("other.ext", file.name);
		Assert.equals("/other.ext", file.toString());
	}

	public function testExtension()
	{
		var file = new File("fil.e.ext", fs.root);
		Assert.equals("fil.e", file.baseName);
		Assert.equals("ext", file.extension);
		file.extension = "png";
		Assert.equals("fil.e.png", file.name);
		file.baseName = "file";
		Assert.equals("file.png", file.name);
	}

	public function testMetadata()
	{
		var file = new File("file.ext", fs.root);
		Assert.isFalse(file.meta.exists("key"));
		file.meta.set("key", 1);
		Assert.isTrue(file.meta.exists("key"));
		Assert.equals(1, file.meta.get("key"));
		Assert.isTrue(file.meta.keys().hasNext());
		Assert.isTrue(file.meta.iterator().hasNext());
		file.meta.remove("key");
		Assert.isTrue(file.meta.keys().hasNext());
		Assert.isTrue(file.meta.iterator().hasNext());
		var m = new Map<String, Dynamic>();
		m.set("key", 1);
		file.meta.setMap(m);
		Assert.equals(1, file.meta.get("key"));
		file.meta.setObject({key2:2});
		Assert.equals(12, file.meta.get("key2"));
	}

	public function testFindByPath()
	{
		// find node
		// find file
		// find directory
	}

	public function testEnsureDirectory()
	{

	}

	public function testEnsureDirectoryForFile()
	{
		
	}

	public function testRemoveByPath()
	{

	}

	public function testFindByPathWithSlash()
	{

	}

	public function testFindByPathCaseInsensitive()
	{

	}

	public function testDuplicatedFileAndDirectory()
	{

	}

	public function testObserveName()
	{

	}

	public function testObserveAddRemove()
	{

	}

	public function testObserveMetadata()
	{

	}
}