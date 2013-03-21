package precog.html;

class HtmlButton 
{
	public var element(default, null) : JQuery;
	@:isVar public var text(get_text, set_text) : String;
	
	@:isVar public var leftIcon(get_leftIcon, set_leftIcon) : String;
	@:isVar public var rightIcon(get_rightIcon, set_rightIcon) : String;
	@:isVar public var active(get_active, set_active) : Bool;
	@:isVar public var enabled(get_enabled, set_enabled) : Bool;

	public function new(?text : String, ?icon : String)
	{
		active = false;
		element = new JQuery('<button type="button" class="btn btn-primary" data-toggle="button"></button>');
		if(null != text)
			this.text = text;
		if(null != icon)
			this.leftIcon = icon;
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
		return leftIcon;

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
		this.element.attr("disabled", s!tate);
		return state;
	}

	function update()
	{
		var buf = [];
		if(null != leftIcon)
			buf.push('<i class="icon-$leftIcon"></i>');

		if(null != text)
		{
			var classes = ["text"];
			if(null != leftIcon)
				classes.push("with-left-icon");
			if(null != righttIcon)
				classes.push("with-right-icon");
			buf.push('<span class="${classes.join(" ")}">$text</span>');
		}

		if(null != rightIcon)
			buf.push('<i class="icon-$rightIcon"></i>');

		element.html(buf.join(""));
	}
}