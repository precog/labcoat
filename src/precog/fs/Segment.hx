package precog.fs;

using thx.core.Strings;

abstract Segment(ESegment)
{
	public function new(v : ESegment)
		this = v;

	static var PATTERN = ~/^[|](.+?)[|](i?)$/;
	@:from public static inline function fromESegment(segment : ESegment)
		return new Segment(segment);
	@:from public static function fromString(s : String)
	{
		return switch (s) {
			case "..":
				new Segment(Up);
			case ".":
				new Segment(Current);
			case pattern if(PATTERN.match(pattern)):
				new Segment(Pattern(PATTERN.matched(1), PATTERN.matched(2)));
			case v:
				new Segment(Literal(v.trim("/")));
		}
	}

	public inline function getESegment() : ESegment
	{
		return this;
	}

	public function getLiteral()
	{
		switch (this) {
			case Literal(v): return v;
			case _: throw "expected a literal segment value";
		}
	}

	public inline function toString()
	{
		return switch (this) {
			case Literal(s):	s;
			case Pattern(p, m):	'|$p|$m';
			case Up:			"..";
			case Current:		".";
		}
	}
}
