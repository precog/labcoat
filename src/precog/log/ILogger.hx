package precog.log;

interface ILogger 
{
	public function log(msg : String, ?pos : haxe.PosInfos) : Void;
}