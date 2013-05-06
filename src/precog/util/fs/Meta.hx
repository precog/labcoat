package precog.util.fs;

class Meta
{
	var map : Map<String, Dynamic>;
	var node : Node;
	public function new(node : Node)
	{
		this.node = node;
		map = new Map<String, Dynamic>();
	}
	public function get(key : String)
		return map.get(key);
	public function set(key : String, value : Dynamic)
	{
		trigger(new MetaChangeEvent(node, key, map.get(key), value));
		map.set(key, value);
		return this;
	}

	public function remove(key : String)
	{
		trigger(new MetaChangeEvent(node, key, map.get(key), null));
		return map.remove(key);
	}
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

	macro function trigger<T>(ethis : haxe.macro.Expr, values : Array<haxe.macro.Expr>)
	{
		return macro { if(null != $ethis.node.filesystem) $ethis.node.filesystem.dispatcher.trigger($a{values}); };
	}
}