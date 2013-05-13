package labcoat.message;

import haxe.PosInfos;

class Log
{
	public var message(default, null) : String;
	public var pos(default, null) : PosInfos;
	public var time(default, null) : Date;
	public function new(message : String, ?pos : PosInfos)
	{
		this.message = message;
		this.pos = pos;
		this.time = Date.now();
	}
}