package precog.html;

import js.JQuery;

class HtmlButton 
{
	public var element(default, null) : JQuery;
	@:isVar public var text(get_text, set_text) : String;
	
	@:isVar public var leftIcon(get_leftIcon, set_leftIcon) : String;
	@:isVar public var size(get_size, set_size) : ButtonSize;
	@:isVar public var rightIcon(get_rightIcon, set_rightIcon) : String;
	@:isVar public var active(get_active, set_active) : Bool;
	@:isVar public var type(get_type, set_type) : ButtonType;
	@:isVar public var enabled(get_enabled, set_enabled) : Bool;

	public function new(?text : String, ?icon : String, ?btnsize : ButtonSize)
	{
		element = new JQuery('<button type="button" class="btn" data-toggle="button"></button>');
		if(null != text)
			this.text = text;

		if(null != icon)
			this.leftIcon = icon;
		if(null == btnsize)
			btnsize = Default;
		this.size = btnsize;
		active = false;
		type = Default;
	}

	function get_text()
		return text;
	function set_text(text : String)
	{
		this.text = text;
		element.find("span.text").html((null == text) ? "" : text);
		return text;
	}

	function get_leftIcon()
		return leftIcon;
	function set_leftIcon(icon : String)
	{
		this.leftIcon = icon;
		update();
		return text;
	}

	function get_rightIcon()
		return rightIcon;
	function set_rightIcon(icon : String)
	{
		this.rightIcon = icon;
		update();
		return text;
	}

	function get_active()
		return active;
	function set_active(state : Bool)
	{
		if(this.active == state) return state;
		this.active = state;
		this.element.toggleClass("active", state);
		return state;
	}

	function get_enabled()
		return enabled;
	function set_enabled(state : Bool)
	{
		if(this.enabled == state) return state;
		this.enabled = state;
		if(state)
			this.element.attr("disabled", "disabled");
		else
			this.element.removeAttr("disabled");
		return state;
	}

	function get_size()
		return size;
	function set_size(value : ButtonSize)
	{
		if(Type.enumEq(size, value)) return value;
		if(null != size) switch(size)
		{
			case Large:		element.removeClass("btn-large");
			case Default:	
			case Small:		element.removeClass("btn-small");
			case Mini:		element.removeClass("btn-mini");
		}
		size = value;
		switch(size)
		{
			case Large:		element.addClass("btn-large");
			case Default:	
			case Small:		element.addClass("btn-small");
			case Mini:		element.addClass("btn-mini");
		}
		return value;
	}

	function get_type()
		return type;
	function set_type(value : ButtonType)
	{
		if(Type.enumEq(type, value)) return value;
		if(null != type) switch(type)
		{
			case Default:
			case Primary:	element.removeClass("btn-primary");
			case Info:		element.removeClass("btn-info");
			case Success:	element.removeClass("btn-success");
			case Warning:	element.removeClass("btn-warning");
			case Danger:	element.removeClass("btn-danger");
			case Inverse:	element.removeClass("btn-inverse");
			case Link:	element.removeClass("btn-link");
		}
		type = value;
		switch(type)
		{
			case Default:
			case Primary:	element.addClass("btn-primary");
			case Info:		element.addClass("btn-info");
			case Success:	element.addClass("btn-success");
			case Warning:	element.addClass("btn-warning");
			case Danger:	element.addClass("btn-danger");
			case Inverse:	element.addClass("btn-inverse");
			case Link:	element.addClass("btn-link");
		}
		return value;
	}

	function update()
	{
		var buf = [];
		if(null != leftIcon)
			buf.push('<i class="left-icon icon-$leftIcon"></i>');

		if(null != text)
		{
			var classes = ["text"];
			if(null != leftIcon)
				classes.push("with-left-icon");
			if(null != rightIcon)
				classes.push("with-right-icon");
			buf.push('<span class="${classes.join(" ")}">$text</span>');
		}

		if(null != rightIcon)
			buf.push('<i class="right-icon icon-$rightIcon"></i>');

		element.html(buf.join(""));
	}
}

enum ButtonSize
{
	Large;
	Default;
	Small;
	Mini;
}

enum ButtonType
{
	Default;
	Primary;
	Info;
	Success;
	Warning;
	Danger;
	Inverse;
	Link;
}