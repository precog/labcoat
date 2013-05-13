package labcoat.message;

class StatusMessage
{
	public var message(default, null) : Dynamic; // should be string or JQuery
	public var type(default, null) : MessageType;
	public var time(default, null) : Date;
	public function new(message : Dynamic, ?type : MessageType)
	{
		this.message = message;
		this.type = null == type ? Error : type;
		this.time = Date.now();
	}

	public function toString()
		return '$type: ${message.toString()} ($time)';
}

enum MessageType
{
	Error;
	Warning;
	Info;
}