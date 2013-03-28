package precog.util.fs;

enum ESegment
{
	Literal(s : String);
	Pattern(reg : EReg);
	Up;
	Current;
}