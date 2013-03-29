package precog.util.fs;

import thx.react.Dispatcher;

#if macro
import haxe.macro.Expr;
#end

@:access(precog.util.fs.Root)
class FileSystem 
{
	public var root(default, null) : Root;
	@:noDoc @:noDisplay public var dispatcher(default, null) : Dispatcher;
	public function new()
	{
		root = new Root(this);
		dispatcher = new Dispatcher();
	}

	macro public function on(ethis : ExprOf<FileSystem>, handler : Expr)
	{
		return macro { $ethis.dispatcher.on($handler); $ethis; };
	}

	macro public function one<T>(ethis : ExprOf<FileSystem>, handler : Expr)
	{
		return macro { $ethis.dispatcher.one($handler); $ethis; };
	}

	macro public function off<T>(ethis : ExprOf<FileSystem>, handler : Expr)
	{
		return macro { $ethis.dispatcher.off($handler); $ethis; };
	}

	public function clear(type : Class<Dynamic>)
	{
		if (null != type)
			dispatcher.clear(type);
	}
}