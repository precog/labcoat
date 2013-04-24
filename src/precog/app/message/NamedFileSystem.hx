package precog.app.message;

class NamedFileSystem implements precog.macro.ValueClass 
{
	var name : String;
	var fs : precog.util.fs.FileSystem;
}