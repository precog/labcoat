package precog.fs;

enum ESegment
{
	Literal(s : String);
	Pattern(pattern : String, mod : String);
	Up;
	Current;
}