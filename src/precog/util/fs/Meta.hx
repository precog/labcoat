package precog.util.fs;

class Meta
{
	var map : Map<String, Dynamic>;
	public function new()
		map = new Map<String, Dynamic>();
	public function get(key : String)
		return map.get(key);
	public function set(key : String, value : Dynamic)
	{
		map.set(key, value);
		return this;
	}
	public function remove(key : String)
		return map.remove(key);
	public function exists(key : String)
		return map.exists(key);
	public function keys()
		return map.keys();
	public function iterator()
		return map.iterator();

	public function setMap(other : Map<String, Dynamic>)
	{
		for(key in other.keys())
			map.set(key, other.get(key));	
	}

	public function setObject(ob : Dynamic)
	{
		for(key in Reflect.fields(ob))
			map.set(key, Reflect.field(ob, key));
	}
}