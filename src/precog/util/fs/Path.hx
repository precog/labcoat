package precog.util.fs;

abstract Path({ absolute : Bool, path : Array<Segment> })
{
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
		var fromRoot = s.substr(0, 1) == "/";
		if(fromRoot)
			s = s.substr(1);
		if(s.substr(-1) == "/")
			s = s.substr(0, s.length - 1);
		var arr = split(s).filter(function(v) return v != "");
		if(fromRoot)
			arr.unshift("/");
		trace(arr);
		return fromArray(arr);
	}

	@:from public static function fromArray(s : Array<String>)
	{
		var fromRoot = s[0] == "/";
		if(fromRoot)
			s.shift();
		return new Path(fromRoot, s.map(Segment.fromString));
	}

	public inline function absolute()
		return this.absolute;

	public inline function segments()
		return this.path;
}