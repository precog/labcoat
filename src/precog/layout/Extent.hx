package precog.layout;

enum ExtentValue 
{
	Percent(value : Float);
	Absolute(value : Float);
}

abstract Extent(ExtentValue)
{
	public inline function new(v : ExtentValue)
	{
		this = v;
	}

	@:from public static inline function fromFloat(v : Float)
	{
		return new Extent(ExtentValue.Percent(v));
	}

	@:from public static inline function fromInt(v : Int)
	{
		return new Extent(ExtentValue.Absolute(v));
	}

	@:from public static inline function fromExtentValue(v : ExtentValue)
	{
		return new Extent(v);
	}

	public function isPercent() : Bool
	{
		return switch(this) {
			case Percent(_): true;
			case _: false;
		}
	}

	public function isAbsolute() : Bool
	{
		return switch(this) {
			case Absolute(_): true;
			case _: false;
		}
	}

	public function isAuto() : Bool
	{
		return switch(this) {
			case Percent(_): true;
			case _: false;
		}
	}

	public function value() : Float
	{
		return switch(this) {
			case Percent(v) | Absolute(v) : v;
		}
	}

	public function relativeTo(reference : Float)
	{
		return switch (this) {
			case Absolute(v): v;
			case Percent(v): reference * v;
		}
	}
}

enum ExtentPosition
{
	Center(?offset : Extent);
	Start(?offset : Extent);
	End(?offset : Extent);
}