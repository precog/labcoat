package precog.fs;

abstract Path({ absolute : Bool, path : Array<Segment> })
{
	public var length(get, never) : Int;
	public function new(absolute : Bool, path : Array<Segment>)
	{
		this = { absolute : absolute, path : path };
	}

	public static function split(s : String)
	{
		var parts = s.split("/"),
			i = 0;
		while(i < parts.length - 1)
		{
			if(parts[i].substr(-1) == "\\")
			{
				parts[i] += parts[i+1];
				parts.splice(i+1, 1);
			} else {
				i++;
			}
		}
		return parts;
	}

	@:from public static function fromString(s : String)
	{
		var absolute = s.substr(0, 1) == "/";
		if(absolute)
			s = s.substr(1);
		if(s.substr(-1) == "/")
			s = s.substr(0, s.length - 1);
		var arr = split(s).filter(function(v) return v != "");
		if(absolute)
			arr.unshift("/");
		return fromArray(arr);
	}

	@:from public static function fromArray(s : Array<String>)
	{
		var absolute = s[0] == "/";
		if(absolute)
			s.shift();
		return new Path(absolute, s.map(Segment.fromString)).simplify();
	}

	public function simplify() : Path
	{
		var path : Array<Segment> = this.path.copy(),
			pos  = 0;
		while(pos < path.length) {
			switch(path[pos].getESegment()) {
				case Literal(_):
					pos++;
				case Pattern(_):
					pos++;
				case Up if(pos == 0 && !this.absolute):
					throw 'cannot crawl above the root path for ';
				case Up if(pos == 0):
					pos++;
				case Up if(switch(path[pos-1].getESegment()) { case Up: true; case _: false; }):
					pos++;
				case Up:
					path.splice(pos-1, 2);
				case Current:
					path.splice(pos, 1);
			}
		}
		return new Path(this.absolute, path);
	}

	private inline function get_length()
		return this.path.length;

	public inline function absolute()
		return this.absolute;

	public inline function segments()
		return this.path;

	public inline function copy()
		return new Path(this.absolute, this.path.copy());

	public function shift()
	{
		var npath = new Path(this.absolute, [this.path.shift()]);
		this.absolute = false;
		return npath;
	}

	public inline function toString()
		return (this.absolute ? "/" : "") + this.path.map(function(s : Segment) return s.toString()).join("/");
}