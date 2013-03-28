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
/*
	public function testAddRemoveFile()
	{
		var file = new File("sample", fs.root);
		Assert.equals(file, fs.root.files().next());
		fs.root.remove(file);
		Assert.isFalse(fs.root.files().hasNext());
	}

	public function testAddRemoveDirectory()
	{
		var dir = new Directory("sample", fs.root);
		Assert.equals(dir, fs.root.directories().next());
		fs.root.remove(dir);
		Assert.isFalse(fs.root.directories().hasNext());
	}

	public function testPath()
	{
		var dir = new Directory("dir", fs.root),
			file = new File("file.ext", dir);
		Assert.equals("/", fs.root.toString());
		Assert.equals("/dir/", dir.toString());
		Assert.equals("/dir/file.ext", file.toString());
	}
*/
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

	public function testMoveNodeInTheSameFilesystem()
	{
		
	}

	public function testMoveNodeToAnotherSameFilesystem()
	{
		
	}

	public function testFindByPath()
	{

	}

	public function testEventAddRemove()
	{

	}

	public function testPagination()
	{

	}

	public function testOrder()
	{

	}

	public function testRename()
	{

	}

	public function testDuplicate()
	{

	}
}