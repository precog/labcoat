package labcoat.message;

class NamedFileSystem implements precog.macro.ValueClass 
{
	var name : String;
	var fs : precog.fs.FileSystem;
}