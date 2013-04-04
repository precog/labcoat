package precog.communicator;

import thx.react.Responder;
import thx.react.Provider;
import thx.react.Promise;
import thx.react.Dispatcher;
import thx.react.Buffer;

#if macro
import haxe.macro.Expr;
#end

class Communicator
{
	@:noDoc @:noDisplay public var provider(default, null)   : Provider;
	@:noDoc @:noDisplay public var responder(default, null)  : Responder;
	@:noDoc @:noDisplay public var dispatcher(default, null) : Dispatcher;
	@:noDoc @:noDisplay public var buffer(default, null)     : Buffer;
	public function new()
	{
		provider   = new Provider();
		responder  = new Responder();
		dispatcher = new Dispatcher();
		buffer     = new Buffer();
	}

	macro public function on(ethis : ExprOf<Communicator>, handler : Expr)
	{
		return macro { $ethis.dispatcher.on($handler); $ethis; };
	}

	macro public function one<T>(ethis : ExprOf<Communicator>, handler : Expr)
	{
		return macro { $ethis.dispatcher.one($handler); $ethis; };
	}

	macro public function off<T>(ethis : ExprOf<Communicator>, handler : Expr)
	{
		return macro { $ethis.dispatcher.off($handler); $ethis; };
	}

	macro public function trigger<T>(ethis : ExprOf<Communicator>, values : Array<Expr>)
	{
		return macro { $ethis.dispatcher.trigger($a{values}); $ethis; };
	}

	public function clear(type : Class<Dynamic>)
	{
		if (null != type)
			dispatcher.clear(type);
	}

	public function demand<T>(type : Class<T>) : Promise<T -> Void>
	{
		return provider.demand(type);
	}
	
	public function provide<T>(data : T)
	{
		provider.provide(data);
		return this;
	}

	public function request<TRequest, TResponse>(payload : TRequest, responseType : Class<TResponse>) : Promise<TResponse -> Void>
	{
		return responder.request(payload, responseType);
	}

	public function respond<TRequest, TResponse>(handler : TRequest -> Null<Promise<TResponse -> Void>>, requestType : Class<TRequest>, responseType : Class<TResponse>)
	{
		return responder.respond(handler, requestType, responseType);
	}

	public function queue<T>(value : T)
	{
		buffer.queueMany([value]);
	}

	public function queueMany<T>(values : Iterable<T>)
	{
		buffer.queueMany(values);
	}

	macro public function consume<T>(ethis : ExprOf<Communicator>, handler : Expr)
	{
		var name = Buffer.getArrayArgumentType(handler);
		return macro $ethis.buffer.consumeImpl($v{name}, $handler);
	}
}