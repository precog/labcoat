package precog.util;

class Uid 
{
	static function s4()
	{
		return StringTools.hex(Math.floor(Math.random() * 0x10000), 4);
	}
	// TODO needs better implementation
	public static function create()
	{
		return (
	      s4() + s4() + "-" +
	      s4() + "-" +
	      s4() + "-" +
	      s4() + "-" +
	      s4() + s4() + s4()
	    );
	}
}