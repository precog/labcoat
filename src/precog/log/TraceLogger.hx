package precog.log;

class TraceLogger implements ILogger 
{
	public function new()
	{
		
	}

	public function log(message : String, ?pos : haxe.PosInfos)
	{
		haxe.Log.trace(message, pos);
	}
}