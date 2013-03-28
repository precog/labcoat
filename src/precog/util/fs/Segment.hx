package precog.util.fs;

abstract Segment(ESegment)
{
	public function new(v : ESegment)
	{
		this = v;
	}
	static var PATTERN = ~/^|(.+?)|(i?)$/;
	@:from public static inline function fromESegment(segment : ESegment)
		return new Segment(segment);
	@:from public static inline function fromEReg(reg : EReg)
		return new Segment(Pattern(reg));
	@:from public static function fromString(s : String)
	{
		return switch (s) {
			case "..":
				new Segment(Up);
			case ".":
				new Segment(Current);
			case pattern if(PATTERN.match(pattern)):
				new Segment(Pattern(new EReg(PATTERN.matched(1), PATTERN.matched(2))));
			case v:
				new Segment(Literal(v));
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
}
