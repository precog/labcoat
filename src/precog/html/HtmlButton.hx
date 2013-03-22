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
	@:isVar public var primary(get_primary, set_primary) : Bool;
	@:isVar public var enabled(get_enabled, set_enabled) : Bool;

	public function new(?text : String, ?icon : String, ?btnsize : ButtonSize)
	{
		element = new JQuery('<button type="button" class="btn" data-toggle="button"></button>');
		if(null != text)
			this.text = text;

		if(null != icon)
			this.leftIcon = icon;
		if(null == btnsize)
			btnsize = Normal;
		this.size = btnsize;
		active = false;
		primary = false;
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

	function get_primary()
		return primary;

	function set_primary(state : Bool)
	{
		if(this.primary == state) return state;
		this.primary = state;
		this.element.toggleClass("btn-primary", state);
		return state;
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
			case Normal:	
			case Small:		element.removeClass("btn-small");
			case Mini:		element.removeClass("btn-mini");
		}
		size = value;
		switch(size)
		{
			case Large:		element.addClass("btn-large");
			case Normal:	
			case Small:		element.addClass("btn-small");
			case Mini:		element.addClass("btn-mini");
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
	Normal;
	Small;
	Mini;
}