(function () { "use strict";
var $estr = function() { return js.Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function inherit() {}; inherit.prototype = from; var proto = new inherit();
	for (var name in fields) proto[name] = fields[name];
	return proto;
}
var EReg = function() { }
EReg.__name__ = ["EReg"];
EReg.prototype = {
	match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,r: null
	,__class__: EReg
}
var HxOverrides = function() { }
HxOverrides.__name__ = ["HxOverrides"];
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
}
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
}
HxOverrides.remove = function(a,obj) {
	var i = 0;
	var l = a.length;
	while(i < l) {
		if(a[i] == obj) {
			a.splice(i,1);
			return true;
		}
		i++;
	}
	return false;
}
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
}
var Lambda = function() { }
Lambda.__name__ = ["Lambda"];
Lambda.array = function(it) {
	var a = new Array();
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var i = $it0.next();
		a.push(i);
	}
	return a;
}
Lambda.has = function(it,elt) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(x == elt) return true;
	}
	return false;
}
var List = function() {
	this.length = 0;
};
List.__name__ = ["List"];
List.prototype = {
	iterator: function() {
		return { h : this.h, hasNext : function() {
			return this.h != null;
		}, next : function() {
			if(this.h == null) return null;
			var x = this.h[0];
			this.h = this.h[1];
			return x;
		}};
	}
	,remove: function(v) {
		var prev = null;
		var l = this.h;
		while(l != null) {
			if(l[0] == v) {
				if(prev == null) this.h = l[1]; else prev[1] = l[1];
				if(this.q == l) this.q = prev;
				this.length--;
				return true;
			}
			prev = l;
			l = l[1];
		}
		return false;
	}
	,add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,length: null
	,q: null
	,h: null
	,__class__: List
}
var Reflect = function() { }
Reflect.__name__ = ["Reflect"];
Reflect.hasField = function(o,field) {
	return Object.prototype.hasOwnProperty.call(o,field);
}
Reflect.field = function(o,field) {
	var v = null;
	try {
		v = o[field];
	} catch( e ) {
	}
	return v;
}
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
}
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && !(f.__name__ || f.__ename__);
}
Reflect.compare = function(a,b) {
	return a == b?0:a > b?1:-1;
}
Reflect.compareMethods = function(f1,f2) {
	if(f1 == f2) return true;
	if(!Reflect.isFunction(f1) || !Reflect.isFunction(f2)) return false;
	return f1.scope == f2.scope && f1.method == f2.method && f1.method != null;
}
Reflect.isObject = function(v) {
	if(v == null) return false;
	var t = typeof(v);
	return t == "string" || t == "object" && !v.__enum__ || t == "function" && (v.__name__ || v.__ename__);
}
Reflect.makeVarArgs = function(f) {
	return function() {
		var a = Array.prototype.slice.call(arguments);
		return f(a);
	};
}
var Std = function() { }
Std.__name__ = ["Std"];
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
var StringBuf = function() {
	this.b = "";
};
StringBuf.__name__ = ["StringBuf"];
StringBuf.prototype = {
	b: null
	,__class__: StringBuf
}
var StringTools = function() { }
StringTools.__name__ = ["StringTools"];
StringTools.htmlEscape = function(s,quotes) {
	s = s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
	return quotes?s.split("\"").join("&quot;").split("'").join("&#039;"):s;
}
StringTools.startsWith = function(s,start) {
	return s.length >= start.length && HxOverrides.substr(s,0,start.length) == start;
}
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	return c > 8 && c < 14 || c == 32;
}
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return HxOverrides.substr(s,r,l - r); else return s;
}
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return HxOverrides.substr(s,0,l - r); else return s;
}
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
}
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
}
var TestAll = function() { }
TestAll.__name__ = ["TestAll"];
TestAll.addTests = function(runner) {
	runner.addCase(new precog.communicator.TestCommunicator());
	runner.addCase(new precog.communicator.TestModuleManager());
	runner.addCase(new precog.geom.TestPoint());
	runner.addCase(new precog.layout.TestLayout());
	runner.addCase(new precog.layout.TestCanvasLayout());
}
TestAll.main = function() {
	var runner = new utest.Runner();
	TestAll.addTests(runner);
	utest.ui.Report.create(runner);
	runner.run();
}
var ValueType = { __ename__ : ["ValueType"], __constructs__ : ["TNull","TInt","TFloat","TBool","TObject","TFunction","TClass","TEnum","TUnknown"] }
ValueType.TNull = ["TNull",0];
ValueType.TNull.toString = $estr;
ValueType.TNull.__enum__ = ValueType;
ValueType.TInt = ["TInt",1];
ValueType.TInt.toString = $estr;
ValueType.TInt.__enum__ = ValueType;
ValueType.TFloat = ["TFloat",2];
ValueType.TFloat.toString = $estr;
ValueType.TFloat.__enum__ = ValueType;
ValueType.TBool = ["TBool",3];
ValueType.TBool.toString = $estr;
ValueType.TBool.__enum__ = ValueType;
ValueType.TObject = ["TObject",4];
ValueType.TObject.toString = $estr;
ValueType.TObject.__enum__ = ValueType;
ValueType.TFunction = ["TFunction",5];
ValueType.TFunction.toString = $estr;
ValueType.TFunction.__enum__ = ValueType;
ValueType.TClass = function(c) { var $x = ["TClass",6,c]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; }
ValueType.TEnum = function(e) { var $x = ["TEnum",7,e]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; }
ValueType.TUnknown = ["TUnknown",8];
ValueType.TUnknown.toString = $estr;
ValueType.TUnknown.__enum__ = ValueType;
var Type = function() { }
Type.__name__ = ["Type"];
Type.getClass = function(o) {
	if(o == null) return null;
	return o.__class__;
}
Type.getEnum = function(o) {
	if(o == null) return null;
	return o.__enum__;
}
Type.getSuperClass = function(c) {
	return c.__super__;
}
Type.getClassName = function(c) {
	var a = c.__name__;
	return a.join(".");
}
Type.getEnumName = function(e) {
	var a = e.__ename__;
	return a.join(".");
}
Type.getInstanceFields = function(c) {
	var a = [];
	for(var i in c.prototype) a.push(i);
	HxOverrides.remove(a,"__class__");
	HxOverrides.remove(a,"__properties__");
	return a;
}
Type["typeof"] = function(v) {
	var _g = typeof(v);
	switch(_g) {
	case "boolean":
		return ValueType.TBool;
	case "string":
		return ValueType.TClass(String);
	case "number":
		if(Math.ceil(v) == v % 2147483648.0) return ValueType.TInt;
		return ValueType.TFloat;
	case "object":
		if(v == null) return ValueType.TNull;
		var e = v.__enum__;
		if(e != null) return ValueType.TEnum(e);
		var c = v.__class__;
		if(c != null) return ValueType.TClass(c);
		return ValueType.TObject;
	case "function":
		if(v.__name__ || v.__ename__) return ValueType.TObject;
		return ValueType.TFunction;
	case "undefined":
		return ValueType.TNull;
	default:
		return ValueType.TUnknown;
	}
}
Type.enumConstructor = function(e) {
	return e[0];
}
Type.enumParameters = function(e) {
	return e.slice(2);
}
Type.enumIndex = function(e) {
	return e[1];
}
var haxe = {}
haxe.StackItem = { __ename__ : ["haxe","StackItem"], __constructs__ : ["CFunction","Module","FilePos","Method","Lambda"] }
haxe.StackItem.CFunction = ["CFunction",0];
haxe.StackItem.CFunction.toString = $estr;
haxe.StackItem.CFunction.__enum__ = haxe.StackItem;
haxe.StackItem.Module = function(m) { var $x = ["Module",1,m]; $x.__enum__ = haxe.StackItem; $x.toString = $estr; return $x; }
haxe.StackItem.FilePos = function(s,file,line) { var $x = ["FilePos",2,s,file,line]; $x.__enum__ = haxe.StackItem; $x.toString = $estr; return $x; }
haxe.StackItem.Method = function(classname,method) { var $x = ["Method",3,classname,method]; $x.__enum__ = haxe.StackItem; $x.toString = $estr; return $x; }
haxe.StackItem.Lambda = function(v) { var $x = ["Lambda",4,v]; $x.__enum__ = haxe.StackItem; $x.toString = $estr; return $x; }
haxe.CallStack = function() { }
haxe.CallStack.__name__ = ["haxe","CallStack"];
haxe.CallStack.callStack = function() {
	var oldValue = Error.prepareStackTrace;
	Error.prepareStackTrace = function(error,callsites) {
		var stack = [];
		var _g = 0;
		while(_g < callsites.length) {
			var site = callsites[_g];
			++_g;
			var method = null;
			var fullName = site.getFunctionName();
			if(fullName != null) {
				var idx = fullName.lastIndexOf(".");
				if(idx >= 0) {
					var className = HxOverrides.substr(fullName,0,idx);
					var methodName = HxOverrides.substr(fullName,idx + 1,null);
					method = haxe.StackItem.Method(className,methodName);
				}
			}
			stack.push(haxe.StackItem.FilePos(method,site.getFileName(),site.getLineNumber()));
		}
		return stack;
	};
	var a = haxe.CallStack.makeStack(new Error().stack);
	a.shift();
	Error.prepareStackTrace = oldValue;
	return a;
}
haxe.CallStack.exceptionStack = function() {
	return [];
}
haxe.CallStack.toString = function(stack) {
	var b = new StringBuf();
	var _g = 0;
	while(_g < stack.length) {
		var s = stack[_g];
		++_g;
		b.b += "\nCalled from ";
		haxe.CallStack.itemToString(b,s);
	}
	return b.b;
}
haxe.CallStack.itemToString = function(b,s) {
	var $e = (s);
	switch( $e[1] ) {
	case 0:
		b.b += "a C function";
		break;
	case 1:
		var s_eModule_0 = $e[2];
		b.b += "module ";
		b.b += Std.string(s_eModule_0);
		break;
	case 2:
		var s_eFilePos_2 = $e[4], s_eFilePos_1 = $e[3], s_eFilePos_0 = $e[2];
		if(s_eFilePos_0 != null) {
			haxe.CallStack.itemToString(b,s_eFilePos_0);
			b.b += " (";
		}
		b.b += Std.string(s_eFilePos_1);
		b.b += " line ";
		b.b += Std.string(s_eFilePos_2);
		if(s_eFilePos_0 != null) b.b += ")";
		break;
	case 3:
		var s_eMethod_1 = $e[3], s_eMethod_0 = $e[2];
		b.b += Std.string(s_eMethod_0);
		b.b += ".";
		b.b += Std.string(s_eMethod_1);
		break;
	case 4:
		var s_eLambda_0 = $e[2];
		b.b += "local function #";
		b.b += Std.string(s_eLambda_0);
		break;
	}
}
haxe.CallStack.makeStack = function(s) {
	if(typeof(s) == "string") {
		var stack = s.split("\n");
		var m = [];
		var _g = 0;
		while(_g < stack.length) {
			var line = stack[_g];
			++_g;
			m.push(haxe.StackItem.Module(line));
		}
		return m;
	} else return s;
}
haxe.Log = function() { }
haxe.Log.__name__ = ["haxe","Log"];
haxe.Log.trace = function(v,infos) {
	js.Boot.__trace(v,infos);
}
haxe.Timer = function(time_ms) {
	var me = this;
	this.id = setInterval(function() {
		me.run();
	},time_ms);
};
haxe.Timer.__name__ = ["haxe","Timer"];
haxe.Timer.delay = function(f,time_ms) {
	var t = new haxe.Timer(time_ms);
	t.run = function() {
		t.stop();
		f();
	};
	return t;
}
haxe.Timer.stamp = function() {
	return new Date().getTime() / 1000;
}
haxe.Timer.prototype = {
	run: function() {
		haxe.Log.trace("run",{ fileName : "Timer.hx", lineNumber : 98, className : "haxe.Timer", methodName : "run"});
	}
	,stop: function() {
		if(this.id == null) return;
		clearInterval(this.id);
		this.id = null;
	}
	,id: null
	,__class__: haxe.Timer
}
haxe.ds = {}
haxe.ds.IntMap = function() {
	this.h = { };
};
haxe.ds.IntMap.__name__ = ["haxe","ds","IntMap"];
haxe.ds.IntMap.prototype = {
	toString: function() {
		var s = new StringBuf();
		s.b += "{";
		var it = this.keys();
		while( it.hasNext() ) {
			var i = it.next();
			s.b += Std.string(i);
			s.b += " => ";
			s.b += Std.string(Std.string(this.get(i)));
			if(it.hasNext()) s.b += ", ";
		}
		s.b += "}";
		return s.b;
	}
	,iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref[i];
		}};
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key | 0);
		}
		return HxOverrides.iter(a);
	}
	,remove: function(key) {
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,exists: function(key) {
		return this.h.hasOwnProperty(key);
	}
	,get: function(key) {
		return this.h[key];
	}
	,set: function(key,value) {
		this.h[key] = value;
	}
	,h: null
	,__class__: haxe.ds.IntMap
}
haxe.ds.ObjectMap = function() { }
haxe.ds.ObjectMap.__name__ = ["haxe","ds","ObjectMap"];
haxe.ds.ObjectMap.prototype = {
	toString: function() {
		var s = new StringBuf();
		s.b += "{";
		var it = this.keys();
		while( it.hasNext() ) {
			var i = it.next();
			s.b += Std.string(Std.string(i));
			s.b += " => ";
			s.b += Std.string(Std.string(this.h[i.__id__]));
			if(it.hasNext()) s.b += ", ";
		}
		s.b += "}";
		return s.b;
	}
	,iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref[i.__id__];
		}};
	}
	,keys: function() {
		var a = [];
		for( var key in this.h.__keys__ ) {
		if(this.h.hasOwnProperty(key)) a.push(this.h.__keys__[key]);
		}
		return HxOverrides.iter(a);
	}
	,remove: function(key) {
		var id = key.__id__;
		if(!this.h.hasOwnProperty(id)) return false;
		delete(this.h[id]);
		delete(this.h.__keys__[id]);
		return true;
	}
	,exists: function(key) {
		return this.h.hasOwnProperty(key.__id__);
	}
	,get: function(key) {
		return this.h[key.__id__];
	}
	,set: function(key,value) {
		var id = key.__id__ != null?key.__id__:key.__id__ = ++haxe.ds.ObjectMap.count;
		this.h[id] = value;
		this.h.__keys__[id] = key;
	}
	,h: null
	,__class__: haxe.ds.ObjectMap
}
haxe.ds.StringMap = function() {
	this.h = { };
};
haxe.ds.StringMap.__name__ = ["haxe","ds","StringMap"];
haxe.ds.StringMap.prototype = {
	toString: function() {
		var s = new StringBuf();
		s.b += "{";
		var it = this.keys();
		while( it.hasNext() ) {
			var i = it.next();
			s.b += Std.string(i);
			s.b += " => ";
			s.b += Std.string(Std.string(this.get(i)));
			if(it.hasNext()) s.b += ", ";
		}
		s.b += "}";
		return s.b;
	}
	,iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref["$" + i];
		}};
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
	}
	,remove: function(key) {
		key = "$" + key;
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,exists: function(key) {
		return this.h.hasOwnProperty("$" + key);
	}
	,get: function(key) {
		return this.h["$" + key];
	}
	,set: function(key,value) {
		this.h["$" + key] = value;
	}
	,h: null
	,__class__: haxe.ds.StringMap
}
haxe.io = {}
haxe.io.Bytes = function() { }
haxe.io.Bytes.__name__ = ["haxe","io","Bytes"];
haxe.io.Bytes.prototype = {
	b: null
	,length: null
	,__class__: haxe.io.Bytes
}
var js = {}
js.Boot = function() { }
js.Boot.__name__ = ["js","Boot"];
js.Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
js.Boot.__trace = function(v,i) {
	var msg = i != null?i.fileName + ":" + i.lineNumber + ": ":"";
	msg += js.Boot.__string_rec(v,"");
	var d;
	if(typeof(document) != "undefined" && (d = document.getElementById("haxe:trace")) != null) d.innerHTML += js.Boot.__unhtml(msg) + "<br/>"; else if(typeof(console) != "undefined" && console.log != null) console.log(msg);
}
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2, _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i;
			var str = "[";
			s += "\t";
			var _g = 0;
			while(_g < l) {
				var i1 = _g++;
				str += (i1 > 0?",":"") + js.Boot.__string_rec(o[i1],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) { ;
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
}
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0, _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
}
js.Boot.__instanceof = function(o,cl) {
	try {
		if(o instanceof cl) {
			if(cl == Array) return o.__enum__ == null;
			return true;
		}
		if(js.Boot.__interfLoop(o.__class__,cl)) return true;
	} catch( e ) {
		if(cl == null) return false;
	}
	switch(cl) {
	case Int:
		return Math.ceil(o%2147483648.0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return o === true || o === false;
	case String:
		return typeof(o) == "string";
	case Dynamic:
		return true;
	default:
		if(o == null) return false;
		if(cl == Class && o.__name__ != null) return true; else null;
		if(cl == Enum && o.__ename__ != null) return true; else null;
		return o.__enum__ == cl;
	}
}
js.Browser = function() { }
js.Browser.__name__ = ["js","Browser"];
var precog = {}
precog.communicator = {}
precog.communicator.Communicator = function() {
	this.provider = new thx.react.Provider();
	this.responder = new thx.react.Responder();
	this.dispatcher = new thx.react.Dispatcher();
};
precog.communicator.Communicator.__name__ = ["precog","communicator","Communicator"];
precog.communicator.Communicator.prototype = {
	respond: function(handler,requestType,responseType) {
		return this.responder.respond(handler,requestType,responseType);
	}
	,request: function(payload,responseType) {
		return this.responder.request(payload,responseType);
	}
	,provide: function(data) {
		this.provider.provide(data);
		return this;
	}
	,demand: function(type) {
		return this.provider.demand(type);
	}
	,clear: function(type) {
		if(null != type) this.dispatcher.clear(type);
	}
	,dispatcher: null
	,responder: null
	,provider: null
	,__class__: precog.communicator.Communicator
}
precog.communicator.Module = function() { }
precog.communicator.Module.__name__ = ["precog","communicator","Module"];
precog.communicator.Module.prototype = {
	disconnect: function(comm) {
	}
	,connect: function(comm) {
	}
	,getName: function() {
		return Type.getClassName(Type.getClass(this));
	}
	,__class__: precog.communicator.Module
}
precog.communicator.ModuleEvent = function(module) {
	this.module = module;
};
precog.communicator.ModuleEvent.__name__ = ["precog","communicator","ModuleEvent"];
precog.communicator.ModuleEvent.prototype = {
	module: null
	,__class__: precog.communicator.ModuleEvent
}
precog.communicator.ModuleConnecting = function(module) {
	precog.communicator.ModuleEvent.call(this,module);
};
precog.communicator.ModuleConnecting.__name__ = ["precog","communicator","ModuleConnecting"];
precog.communicator.ModuleConnecting.__super__ = precog.communicator.ModuleEvent;
precog.communicator.ModuleConnecting.prototype = $extend(precog.communicator.ModuleEvent.prototype,{
	__class__: precog.communicator.ModuleConnecting
});
precog.communicator.ModuleDisconnecting = function(module) {
	precog.communicator.ModuleEvent.call(this,module);
};
precog.communicator.ModuleDisconnecting.__name__ = ["precog","communicator","ModuleDisconnecting"];
precog.communicator.ModuleDisconnecting.__super__ = precog.communicator.ModuleEvent;
precog.communicator.ModuleDisconnecting.prototype = $extend(precog.communicator.ModuleEvent.prototype,{
	__class__: precog.communicator.ModuleDisconnecting
});
precog.communicator.ModuleConnected = function(module) {
	precog.communicator.ModuleEvent.call(this,module);
};
precog.communicator.ModuleConnected.__name__ = ["precog","communicator","ModuleConnected"];
precog.communicator.ModuleConnected.__super__ = precog.communicator.ModuleEvent;
precog.communicator.ModuleConnected.prototype = $extend(precog.communicator.ModuleEvent.prototype,{
	__class__: precog.communicator.ModuleConnected
});
precog.communicator.ModuleDisconnected = function(module) {
	precog.communicator.ModuleEvent.call(this,module);
};
precog.communicator.ModuleDisconnected.__name__ = ["precog","communicator","ModuleDisconnected"];
precog.communicator.ModuleDisconnected.__super__ = precog.communicator.ModuleEvent;
precog.communicator.ModuleDisconnected.prototype = $extend(precog.communicator.ModuleEvent.prototype,{
	__class__: precog.communicator.ModuleDisconnected
});
precog.communicator.ModuleManager = function() {
	this.communicator = new precog.communicator.Communicator();
	this.communicator.provide(this);
	this.modules = [];
};
precog.communicator.ModuleManager.__name__ = ["precog","communicator","ModuleManager"];
precog.communicator.ModuleManager.prototype = {
	removeModule: function(module) {
		if(HxOverrides.remove(this.modules,module)) {
			this.communicator.dispatcher.binder.dispatch("precog.communicator.ModuleDisconnecting precog.communicator.ModuleEvent Dynamic",[new precog.communicator.ModuleDisconnecting(module)]);
			this.communicator;
			module.disconnect(this.communicator);
			this.communicator.dispatcher.binder.dispatch("precog.communicator.ModuleDisconnected precog.communicator.ModuleEvent Dynamic",[new precog.communicator.ModuleDisconnected(module)]);
			this.communicator;
		}
	}
	,addModule: function(module) {
		this.modules.push(module);
		this.communicator.dispatcher.binder.dispatch("precog.communicator.ModuleConnecting precog.communicator.ModuleEvent Dynamic",[new precog.communicator.ModuleConnecting(module)]);
		this.communicator;
		module.connect(this.communicator);
		this.communicator.dispatcher.binder.dispatch("precog.communicator.ModuleConnected precog.communicator.ModuleEvent Dynamic",[new precog.communicator.ModuleConnected(module)]);
		this.communicator;
	}
	,modules: null
	,communicator: null
	,__class__: precog.communicator.ModuleManager
}
precog.communicator.TestCommunicator = function() {
};
precog.communicator.TestCommunicator.__name__ = ["precog","communicator","TestCommunicator"];
precog.communicator.TestCommunicator.prototype = {
	testRequestRespond: function() {
		var comm = new precog.communicator.Communicator();
		comm.request("haxe",String).then(function(s) {
			utest.Assert.equals("HAXE",s,null,{ fileName : "TestCommunicator.hx", lineNumber : 29, className : "precog.communicator.TestCommunicator", methodName : "testRequestRespond"});
		});
		comm.respond(function(s) {
			return new thx.react.Deferred().resolve(s.toUpperCase());
		},String,String);
	}
	,testDemandProvide: function() {
		var comm = new precog.communicator.Communicator();
		comm.demand(String).then(function(s) {
			utest.Assert.equals("Haxe",s,null,{ fileName : "TestCommunicator.hx", lineNumber : 22, className : "precog.communicator.TestCommunicator", methodName : "testDemandProvide"});
		});
		comm.provide("Haxe");
	}
	,testOnTrigger: function() {
		var comm = new precog.communicator.Communicator();
		comm.dispatcher.binder.bind("String",{ fun : function(msg) {
			utest.Assert.equals("Haxe",msg,null,{ fileName : "TestCommunicator.hx", lineNumber : 14, className : "precog.communicator.TestCommunicator", methodName : "testOnTrigger"});
		}, arity : 1});
		comm;
		comm.dispatcher.binder.dispatch("String Dynamic",["Haxe"]);
		comm;
	}
	,__class__: precog.communicator.TestCommunicator
}
precog.communicator.TestModuleManager = function() {
};
precog.communicator.TestModuleManager.__name__ = ["precog","communicator","TestModuleManager"];
precog.communicator.TestModuleManager.prototype = {
	testModuleEvents: function() {
		var manager = new precog.communicator.ModuleManager(), module = new precog.communicator.SampleModule(), monitor = new precog.communicator.EventCounterModule(module);
		manager.addModule(monitor);
		utest.Assert.equals(0,monitor.connecting,null,{ fileName : "TestModuleManager.hx", lineNumber : 38, className : "precog.communicator.TestModuleManager", methodName : "testModuleEvents"});
		utest.Assert.equals(0,monitor.connected,null,{ fileName : "TestModuleManager.hx", lineNumber : 39, className : "precog.communicator.TestModuleManager", methodName : "testModuleEvents"});
		manager.addModule(module);
		utest.Assert.equals(1,monitor.connecting,null,{ fileName : "TestModuleManager.hx", lineNumber : 41, className : "precog.communicator.TestModuleManager", methodName : "testModuleEvents"});
		utest.Assert.equals(1,monitor.connected,null,{ fileName : "TestModuleManager.hx", lineNumber : 42, className : "precog.communicator.TestModuleManager", methodName : "testModuleEvents"});
		utest.Assert.equals(0,monitor.disconnecting,null,{ fileName : "TestModuleManager.hx", lineNumber : 44, className : "precog.communicator.TestModuleManager", methodName : "testModuleEvents"});
		utest.Assert.equals(0,monitor.disconnected,null,{ fileName : "TestModuleManager.hx", lineNumber : 45, className : "precog.communicator.TestModuleManager", methodName : "testModuleEvents"});
		manager.removeModule(module);
		utest.Assert.equals(1,monitor.disconnecting,null,{ fileName : "TestModuleManager.hx", lineNumber : 47, className : "precog.communicator.TestModuleManager", methodName : "testModuleEvents"});
		utest.Assert.equals(1,monitor.disconnected,null,{ fileName : "TestModuleManager.hx", lineNumber : 48, className : "precog.communicator.TestModuleManager", methodName : "testModuleEvents"});
	}
	,testProvideManager: function() {
		var manager = new precog.communicator.ModuleManager(), module = new precog.communicator.SampleModule();
		utest.Assert.isNull(module.manager,null,{ fileName : "TestModuleManager.hx", lineNumber : 27, className : "precog.communicator.TestModuleManager", methodName : "testProvideManager"});
		manager.addModule(module);
		utest.Assert.equals(manager,module.manager,null,{ fileName : "TestModuleManager.hx", lineNumber : 29, className : "precog.communicator.TestModuleManager", methodName : "testProvideManager"});
	}
	,testConnectDisconnect: function() {
		var manager = new precog.communicator.ModuleManager(), module = new precog.communicator.SampleModule();
		utest.Assert.isFalse(module.connected,null,{ fileName : "TestModuleManager.hx", lineNumber : 15, className : "precog.communicator.TestModuleManager", methodName : "testConnectDisconnect"});
		manager.addModule(module);
		utest.Assert.isTrue(module.connected,null,{ fileName : "TestModuleManager.hx", lineNumber : 17, className : "precog.communicator.TestModuleManager", methodName : "testConnectDisconnect"});
		utest.Assert.isFalse(module.disconnected,null,{ fileName : "TestModuleManager.hx", lineNumber : 18, className : "precog.communicator.TestModuleManager", methodName : "testConnectDisconnect"});
		manager.removeModule(module);
		utest.Assert.isTrue(module.disconnected,null,{ fileName : "TestModuleManager.hx", lineNumber : 20, className : "precog.communicator.TestModuleManager", methodName : "testConnectDisconnect"});
	}
	,__class__: precog.communicator.TestModuleManager
}
precog.communicator.SampleModule = function() {
	this.disconnected = false;
	this.connected = false;
};
precog.communicator.SampleModule.__name__ = ["precog","communicator","SampleModule"];
precog.communicator.SampleModule.__super__ = precog.communicator.Module;
precog.communicator.SampleModule.prototype = $extend(precog.communicator.Module.prototype,{
	disconnect: function(comm) {
		this.disconnected = true;
	}
	,connect: function(comm) {
		var _g = this;
		this.connected = true;
		comm.demand(precog.communicator.ModuleManager).then(function(m) {
			_g.manager = m;
		});
	}
	,manager: null
	,disconnected: null
	,connected: null
	,__class__: precog.communicator.SampleModule
});
precog.communicator.EventCounterModule = function(identity) {
	this.disconnected = 0;
	this.disconnecting = 0;
	this.connected = 0;
	this.connecting = 0;
	this.identity = identity;
};
precog.communicator.EventCounterModule.__name__ = ["precog","communicator","EventCounterModule"];
precog.communicator.EventCounterModule.__super__ = precog.communicator.Module;
precog.communicator.EventCounterModule.prototype = $extend(precog.communicator.Module.prototype,{
	connect: function(comm) {
		var _g = this;
		comm.dispatcher.binder.bind("precog.communicator.ModuleConnecting",{ fun : function(e) {
			_g.connecting++;
			utest.Assert.equals(_g.identity,e.module,null,{ fileName : "TestModuleManager.hx", lineNumber : 91, className : "precog.communicator.EventCounterModule", methodName : "connect"});
		}, arity : 1});
		comm;
		comm.dispatcher.binder.bind("precog.communicator.ModuleConnected",{ fun : function(e) {
			if(e.module == _g) return;
			_g.connected++;
			utest.Assert.equals(_g.identity,e.module,null,{ fileName : "TestModuleManager.hx", lineNumber : 97, className : "precog.communicator.EventCounterModule", methodName : "connect"});
		}, arity : 1});
		comm;
		comm.dispatcher.binder.bind("precog.communicator.ModuleDisconnecting",{ fun : function(e) {
			_g.disconnecting++;
			utest.Assert.equals(_g.identity,e.module,null,{ fileName : "TestModuleManager.hx", lineNumber : 101, className : "precog.communicator.EventCounterModule", methodName : "connect"});
		}, arity : 1});
		comm;
		comm.dispatcher.binder.bind("precog.communicator.ModuleDisconnected",{ fun : function(e) {
			_g.disconnected++;
			utest.Assert.equals(_g.identity,e.module,null,{ fileName : "TestModuleManager.hx", lineNumber : 105, className : "precog.communicator.EventCounterModule", methodName : "connect"});
		}, arity : 1});
		comm;
	}
	,identity: null
	,disconnected: null
	,disconnecting: null
	,connected: null
	,connecting: null
	,__class__: precog.communicator.EventCounterModule
});
precog.geom = {}
precog.geom.Point = function(x,y) {
	if(y == null) y = 0.0;
	if(x == null) x = 0.0;
	this.x = x;
	this.y = y;
};
precog.geom.Point.__name__ = ["precog","geom","Point"];
precog.geom.Point.prototype = {
	set: function(x,y) {
		if(this.x == x && this.y == y) return;
		this.x = x;
		this.y = y;
		if(null != this._observable) this._observable.notify(this);
	}
	,get_observable: function() {
		return null == this._observable?this._observable = new thx.react.Observable():this._observable;
	}
	,equals: function(other) {
		return this.x == other.x && this.y == other.y;
	}
	,_observable: null
	,observable: null
	,y: null
	,x: null
	,__class__: precog.geom.Point
}
precog.geom.MutablePoint = function(x,y) {
	precog.geom.Point.call(this,x,y);
};
precog.geom.MutablePoint.__name__ = ["precog","geom","MutablePoint"];
precog.geom.MutablePoint.__super__ = precog.geom.Point;
precog.geom.MutablePoint.prototype = $extend(precog.geom.Point.prototype,{
	set: function(x,y) {
		precog.geom.Point.prototype.set.call(this,x,y);
	}
	,__class__: precog.geom.MutablePoint
});
precog.geom.Rectangle = function(x,y,width,height) {
	if(height == null) height = 0.0;
	if(width == null) width = 0.0;
	if(y == null) y = 0.0;
	if(x == null) x = 0.0;
	this.position = new precog.geom.Point(x,y);
	this.size = new precog.geom.Point(width,height);
};
precog.geom.Rectangle.__name__ = ["precog","geom","Rectangle"];
precog.geom.Rectangle.prototype = {
	equals: function(other) {
		return this.position.equals(other.position) && this.size.equals(other.size);
	}
	,setPosition: function(x,y) {
		if(this.position.x == x && this.position.y == y) return;
		this.position.set(x,y);
	}
	,setSize: function(width,height) {
		if(this.size.x == width && this.size.y == height) return;
		this.size.set(width,height);
	}
	,size: null
	,position: null
	,__class__: precog.geom.Rectangle
}
precog.geom.MutableRectangle = function(x,y,width,height) {
	precog.geom.Rectangle.call(this,x,y,width,height);
};
precog.geom.MutableRectangle.__name__ = ["precog","geom","MutableRectangle"];
precog.geom.MutableRectangle.__super__ = precog.geom.Rectangle;
precog.geom.MutableRectangle.prototype = $extend(precog.geom.Rectangle.prototype,{
	setPosition: function(x,y) {
		precog.geom.Rectangle.prototype.setPosition.call(this,x,y);
	}
	,setSize: function(width,height) {
		precog.geom.Rectangle.prototype.setSize.call(this,width,height);
	}
	,__class__: precog.geom.MutableRectangle
});
precog.geom.TestPoint = function() {
};
precog.geom.TestPoint.__name__ = ["precog","geom","TestPoint"];
precog.geom.TestPoint.prototype = {
	testObservable: function() {
		var x = 0.0, y = 0.0, point = new precog.geom.MutablePoint(0,0);
		thx.react.IObservables.addListener(null == point._observable?point._observable = new thx.react.Observable():point._observable,function(point1) {
			x = point1.x;
			y = point1.y;
		});
		point.set(1,2);
		utest.Assert.equals(1,x,null,{ fileName : "TestPoint.hx", lineNumber : 32, className : "precog.geom.TestPoint", methodName : "testObservable"});
		utest.Assert.equals(2,y,null,{ fileName : "TestPoint.hx", lineNumber : 33, className : "precog.geom.TestPoint", methodName : "testObservable"});
	}
	,testValues: function() {
		var point = new precog.geom.Point(1,2);
		utest.Assert.equals(1,point.x,null,{ fileName : "TestPoint.hx", lineNumber : 18, className : "precog.geom.TestPoint", methodName : "testValues"});
		utest.Assert.equals(2,point.y,null,{ fileName : "TestPoint.hx", lineNumber : 19, className : "precog.geom.TestPoint", methodName : "testValues"});
	}
	,__class__: precog.geom.TestPoint
}
precog.layout = {}
precog.layout.Layout = function(width,height) {
	this.size = new precog.geom.MutablePoint(width,height);
	this.suspended = false;
	this.calculatedBoundaries = new precog.geom.MutableRectangle();
	this.panels = new precog.layout.LayoutPanels(this);
	this.onpanel = { add : this.panels.observableAdd, remove : this.panels.observableRemove};
};
precog.layout.Layout.__name__ = ["precog","layout","Layout"];
precog.layout.Layout.prototype = {
	iterator: function() {
		return HxOverrides.iter(this.panels.panels);
	}
	,updatePanel: function(panel) {
		throw "abstract method, must override";
	}
	,update: function() {
		if(this.suspended) return;
		var $it0 = HxOverrides.iter(this.panels.panels);
		while( $it0.hasNext() ) {
			var panel = $it0.next();
			this.updatePanel(panel);
		}
	}
	,get_boundaries: function() {
		return this.calculatedBoundaries;
	}
	,resume: function() {
		this.suspended = false;
		this.update();
	}
	,suspend: function() {
		this.suspended = true;
	}
	,panels: null
	,calculatedBoundaries: null
	,onpanel: null
	,boundaries: null
	,size: null
	,suspended: null
	,__class__: precog.layout.Layout
}
precog.layout.CanvasLayout = function(width,height) {
	var _g = this;
	precog.layout.Layout.call(this,width,height);
	thx.react.IObservables.addListener(this.onpanel.remove,function(panel) {
		_g.canvases.remove(panel);
	});
};
precog.layout.CanvasLayout.__name__ = ["precog","layout","CanvasLayout"];
precog.layout.CanvasLayout.anchorX = function(anchor,width) {
	return (function($this) {
		var $r;
		switch( (anchor)[1] ) {
		case 1:
		case 4:
		case 6:
			$r = 0.0;
			break;
		case 2:
		case 0:
		case 7:
			$r = width / 2;
			break;
		case 3:
		case 5:
		case 8:
			$r = width;
			break;
		}
		return $r;
	}(this));
}
precog.layout.CanvasLayout.anchorY = function(anchor,height) {
	return (function($this) {
		var $r;
		switch( (anchor)[1] ) {
		case 1:
		case 2:
		case 3:
			$r = 0.0;
			break;
		case 4:
		case 0:
		case 5:
			$r = height / 2;
			break;
		case 6:
		case 7:
		case 8:
			$r = height;
			break;
		}
		return $r;
	}(this));
}
precog.layout.CanvasLayout.__super__ = precog.layout.Layout;
precog.layout.CanvasLayout.prototype = $extend(precog.layout.Layout.prototype,{
	updatePanel: function(panel) {
		var c = this.canvases.h[panel.__id__];
		panel.size.set(precog.layout._Extent.ExtentImpl.relativeTo(c.width,this.size.x),precog.layout._Extent.ExtentImpl.relativeTo(c.height,this.size.y));
		panel.position.set(precog.layout._Extent.ExtentImpl.relativeTo(c.x,this.size.x) + precog.layout.CanvasLayout.anchorX(c.layoutAnchor,this.size.x) - precog.layout.CanvasLayout.anchorX(c.panelAnchor,panel.size.x),precog.layout._Extent.ExtentImpl.relativeTo(c.y,this.size.y) + precog.layout.CanvasLayout.anchorY(c.layoutAnchor,this.size.y) - precog.layout.CanvasLayout.anchorY(c.panelAnchor,panel.size.y));
	}
	,addPanel: function(panel) {
		var canvaspanel = new precog.layout.CanvasPanel(this);
		this.panels.addPanel(panel);
		this.canvases.set(panel,canvaspanel);
		return canvaspanel;
	}
	,canvases: null
	,__class__: precog.layout.CanvasLayout
});
precog.layout.CanvasPanel = function(layout) {
	this.layout = layout;
	this.layoutAnchor = precog.layout.CanvasAnchor.TopLeft;
	this.panelAnchor = precog.layout.CanvasAnchor.TopLeft;
	this.width = precog.layout.ExtentValue.Percent(0);
	this.height = precog.layout.ExtentValue.Percent(0);
	this.x = precog.layout.ExtentValue.Percent(0);
	this.y = precog.layout.ExtentValue.Percent(0);
};
precog.layout.CanvasPanel.__name__ = ["precog","layout","CanvasPanel"];
precog.layout.CanvasPanel.prototype = {
	setOffset: function(x,y) {
		this.x = x;
		this.y = y;
		this.layout.update();
		return this;
	}
	,setPoint: function(width,height) {
		this.width = width;
		this.height = height;
		this.layout.update();
		return this;
	}
	,setPanelAnchor: function(anchor) {
		this.panelAnchor = anchor;
		this.layout.update();
		return this;
	}
	,setLayoutAnchor: function(anchor) {
		this.layoutAnchor = anchor;
		this.layout.update();
		return this;
	}
	,y: null
	,x: null
	,height: null
	,width: null
	,panelAnchor: null
	,layoutAnchor: null
	,layout: null
	,__class__: precog.layout.CanvasPanel
}
precog.layout.CanvasAnchor = { __ename__ : ["precog","layout","CanvasAnchor"], __constructs__ : ["Center","TopLeft","Top","TopRight","Left","Right","BottomLeft","Bottom","BottomRight"] }
precog.layout.CanvasAnchor.Center = ["Center",0];
precog.layout.CanvasAnchor.Center.toString = $estr;
precog.layout.CanvasAnchor.Center.__enum__ = precog.layout.CanvasAnchor;
precog.layout.CanvasAnchor.TopLeft = ["TopLeft",1];
precog.layout.CanvasAnchor.TopLeft.toString = $estr;
precog.layout.CanvasAnchor.TopLeft.__enum__ = precog.layout.CanvasAnchor;
precog.layout.CanvasAnchor.Top = ["Top",2];
precog.layout.CanvasAnchor.Top.toString = $estr;
precog.layout.CanvasAnchor.Top.__enum__ = precog.layout.CanvasAnchor;
precog.layout.CanvasAnchor.TopRight = ["TopRight",3];
precog.layout.CanvasAnchor.TopRight.toString = $estr;
precog.layout.CanvasAnchor.TopRight.__enum__ = precog.layout.CanvasAnchor;
precog.layout.CanvasAnchor.Left = ["Left",4];
precog.layout.CanvasAnchor.Left.toString = $estr;
precog.layout.CanvasAnchor.Left.__enum__ = precog.layout.CanvasAnchor;
precog.layout.CanvasAnchor.Right = ["Right",5];
precog.layout.CanvasAnchor.Right.toString = $estr;
precog.layout.CanvasAnchor.Right.__enum__ = precog.layout.CanvasAnchor;
precog.layout.CanvasAnchor.BottomLeft = ["BottomLeft",6];
precog.layout.CanvasAnchor.BottomLeft.toString = $estr;
precog.layout.CanvasAnchor.BottomLeft.__enum__ = precog.layout.CanvasAnchor;
precog.layout.CanvasAnchor.Bottom = ["Bottom",7];
precog.layout.CanvasAnchor.Bottom.toString = $estr;
precog.layout.CanvasAnchor.Bottom.__enum__ = precog.layout.CanvasAnchor;
precog.layout.CanvasAnchor.BottomRight = ["BottomRight",8];
precog.layout.CanvasAnchor.BottomRight.toString = $estr;
precog.layout.CanvasAnchor.BottomRight.__enum__ = precog.layout.CanvasAnchor;
precog.layout.ExtentValue = { __ename__ : ["precog","layout","ExtentValue"], __constructs__ : ["Percent","Absolute"] }
precog.layout.ExtentValue.Percent = function(value) { var $x = ["Percent",0,value]; $x.__enum__ = precog.layout.ExtentValue; $x.toString = $estr; return $x; }
precog.layout.ExtentValue.Absolute = function(value) { var $x = ["Absolute",1,value]; $x.__enum__ = precog.layout.ExtentValue; $x.toString = $estr; return $x; }
precog.layout._Extent = {}
precog.layout._Extent.ExtentImpl = function() { }
precog.layout._Extent.ExtentImpl.__name__ = ["precog","layout","_Extent","ExtentImpl"];
precog.layout._Extent.ExtentImpl._new = function(v) {
	return v;
}
precog.layout._Extent.ExtentImpl.fromFloat = function(v) {
	return precog.layout.ExtentValue.Percent(v);
}
precog.layout._Extent.ExtentImpl.fromInt = function(v) {
	return precog.layout.ExtentValue.Absolute(v);
}
precog.layout._Extent.ExtentImpl.fromExtentValue = function(v) {
	return v;
}
precog.layout._Extent.ExtentImpl.isPercent = function(this1) {
	return (function($this) {
		var $r;
		switch( (this1)[1] ) {
		case 0:
			$r = true;
			break;
		default:
			$r = false;
		}
		return $r;
	}(this));
}
precog.layout._Extent.ExtentImpl.isAbsolute = function(this1) {
	return (function($this) {
		var $r;
		switch( (this1)[1] ) {
		case 1:
			$r = true;
			break;
		default:
			$r = false;
		}
		return $r;
	}(this));
}
precog.layout._Extent.ExtentImpl.isAuto = function(this1) {
	return (function($this) {
		var $r;
		switch( (this1)[1] ) {
		case 0:
			$r = true;
			break;
		default:
			$r = false;
		}
		return $r;
	}(this));
}
precog.layout._Extent.ExtentImpl.value = function(this1) {
	return (function($this) {
		var $r;
		var $e = (this1);
		switch( $e[1] ) {
		case 0:
		case 1:
			var this_ePercent_0 = $e[2];
			$r = this_ePercent_0;
			break;
		}
		return $r;
	}(this));
}
precog.layout._Extent.ExtentImpl.relativeTo = function(this1,reference) {
	return (function($this) {
		var $r;
		var $e = (this1);
		switch( $e[1] ) {
		case 1:
			var this_eAbsolute_0 = $e[2];
			$r = this_eAbsolute_0;
			break;
		case 0:
			var this_ePercent_0 = $e[2];
			$r = reference * this_ePercent_0;
			break;
		}
		return $r;
	}(this));
}
precog.layout.ExtentPosition = { __ename__ : ["precog","layout","ExtentPosition"], __constructs__ : ["Center","Start","End"] }
precog.layout.ExtentPosition.Center = function(offset) { var $x = ["Center",0,offset]; $x.__enum__ = precog.layout.ExtentPosition; $x.toString = $estr; return $x; }
precog.layout.ExtentPosition.Start = function(offset) { var $x = ["Start",1,offset]; $x.__enum__ = precog.layout.ExtentPosition; $x.toString = $estr; return $x; }
precog.layout.ExtentPosition.End = function(offset) { var $x = ["End",2,offset]; $x.__enum__ = precog.layout.ExtentPosition; $x.toString = $estr; return $x; }
precog.layout.LayoutPanels = function(layout) {
	this.layout = layout;
	this.panels = [];
	this.observableAdd = new thx.react.Observable();
	this.observableRemove = new thx.react.Observable();
};
precog.layout.LayoutPanels.__name__ = ["precog","layout","LayoutPanels"];
precog.layout.LayoutPanels.prototype = {
	iterator: function() {
		return HxOverrides.iter(this.panels);
	}
	,resumer: function(f) {
		if(this.layout.suspended) f(); else {
			this.layout.suspend();
			f();
			this.layout.resume();
		}
	}
	,clear: function() {
		var _g = this;
		var all = this.panels.slice();
		this.resumer(function() {
			while(all.length > 0) _g.removePanel(all.shift());
		});
		this.layout.update();
	}
	,removePanel: function(panel) {
		var _g = this;
		this.resumer(function() {
			panel.setLayout(null);
			HxOverrides.remove(_g.panels,panel);
			_g.observableRemove.notify(panel);
		});
		this.layout.update();
	}
	,addPanel: function(panel) {
		var _g = this;
		this.resumer(function() {
			panel.setLayout(_g.layout);
			_g.panels.push(panel);
			_g.observableAdd.notify(panel);
		});
		this.layout.update();
	}
	,observableRemove: null
	,observableAdd: null
	,layout: null
	,panels: null
	,__class__: precog.layout.LayoutPanels
}
precog.layout.Panel = function() {
	this.position = new precog.geom.MutablePoint(0,0);
	this.size = new precog.geom.MutablePoint(0,0);
};
precog.layout.Panel.__name__ = ["precog","layout","Panel"];
precog.layout.Panel.prototype = {
	remove: function() {
		this.setLayout(null);
	}
	,setLayout: function(layout) {
		if(null != this.parentLayout) this.parentLayout.panels.removePanel(this);
		this.parentLayout = layout;
	}
	,parentLayout: null
	,size: null
	,position: null
	,__class__: precog.layout.Panel
}
precog.layout.TestCanvasLayout = function() {
};
precog.layout.TestCanvasLayout.__name__ = ["precog","layout","TestCanvasLayout"];
precog.layout.TestCanvasLayout.prototype = {
	testSize: function() {
	}
	,testAnchorPanel: function() {
	}
	,testAnchorLayout: function() {
	}
	,testDefault: function() {
		this.layout.addPanel(this.panel);
		utest.Assert.isTrue(this.panel.size.equals(precog.layout.TestCanvasLayout.point0),null,{ fileName : "TestCanvasLayout.hx", lineNumber : 22, className : "precog.layout.TestCanvasLayout", methodName : "testDefault"});
		utest.Assert.isTrue(this.panel.position.equals(precog.layout.TestCanvasLayout.point0),null,{ fileName : "TestCanvasLayout.hx", lineNumber : 23, className : "precog.layout.TestCanvasLayout", methodName : "testDefault"});
	}
	,setup: function() {
		this.layout = new precog.layout.CanvasLayout(200,100);
		this.panel = new precog.layout.Panel();
	}
	,panel: null
	,layout: null
	,__class__: precog.layout.TestCanvasLayout
}
precog.layout.TestLayout = function() {
	precog.layout.Layout.call(this,200,100);
};
precog.layout.TestLayout.__name__ = ["precog","layout","TestLayout"];
precog.layout.TestLayout.__super__ = precog.layout.Layout;
precog.layout.TestLayout.prototype = $extend(precog.layout.Layout.prototype,{
	updatePanel: function(panel) {
		this.updated = true;
	}
	,updated: null
	,teardown: function() {
		this.panels.clear();
	}
	,setup: function() {
		this.updated = false;
	}
	,testSuspendResume: function() {
		this.suspend();
		var panel = new precog.layout.Panel();
		this.panels.addPanel(panel);
		utest.Assert.isFalse(this.updated,null,{ fileName : "TestLayout.hx", lineNumber : 42, className : "precog.layout.TestLayout", methodName : "testSuspendResume"});
		this.panels.removePanel(panel);
		utest.Assert.isTrue(this.updated,null,{ fileName : "TestLayout.hx", lineNumber : 44, className : "precog.layout.TestLayout", methodName : "testSuspendResume"});
	}
	,testUpdateOnRemove: function() {
		var panel = new precog.layout.Panel();
		this.panels.addPanel(panel);
		this.updated = false;
		this.panels.removePanel(panel);
		utest.Assert.isTrue(this.updated,null,{ fileName : "TestLayout.hx", lineNumber : 34, className : "precog.layout.TestLayout", methodName : "testUpdateOnRemove"});
	}
	,testUpdateOnAdd: function() {
		this.panels.addPanel(new precog.layout.Panel());
		utest.Assert.isTrue(this.updated,null,{ fileName : "TestLayout.hx", lineNumber : 25, className : "precog.layout.TestLayout", methodName : "testUpdateOnAdd"});
	}
	,testAddRemovePanel: function() {
		var layout = this, panel = new precog.layout.Panel();
		utest.Assert.isFalse(layout.iterator().hasNext(),null,{ fileName : "TestLayout.hx", lineNumber : 15, className : "precog.layout.TestLayout", methodName : "testAddRemovePanel"});
		layout.panels.addPanel(panel);
		utest.Assert.isTrue(layout.iterator().hasNext(),null,{ fileName : "TestLayout.hx", lineNumber : 17, className : "precog.layout.TestLayout", methodName : "testAddRemovePanel"});
		layout.panels.removePanel(panel);
		utest.Assert.isFalse(layout.iterator().hasNext(),null,{ fileName : "TestLayout.hx", lineNumber : 19, className : "precog.layout.TestLayout", methodName : "testAddRemovePanel"});
	}
	,__class__: precog.layout.TestLayout
});
var thx = {}
thx.core = {}
thx.core.Arrays = function() { }
thx.core.Arrays.__name__ = ["thx","core","Arrays"];
thx.core.Arrays.cross = function(a,b) {
	var r = [];
	var _g = 0;
	while(_g < a.length) {
		var va = a[_g];
		++_g;
		var _g1 = 0;
		while(_g1 < b.length) {
			var vb = b[_g1];
			++_g1;
			r.push([va,vb]);
		}
	}
	return r;
}
thx.core.Arrays.crossMulti = function(a) {
	var acopy = a.slice(), result = acopy.shift().map(function(v) {
		return [v];
	});
	while(acopy.length > 0) {
		var arr = acopy.shift(), tresult = result;
		result = [];
		var _g = 0;
		while(_g < arr.length) {
			var v = arr[_g];
			++_g;
			var _g1 = 0;
			while(_g1 < tresult.length) {
				var ar = tresult[_g1];
				++_g1;
				var t = ar.slice();
				t.push(v);
				result.push(t);
			}
		}
	}
	return result;
}
thx.core.Arrays.pushIf = function(arr,cond,value) {
	if(cond) arr.push(value);
	return arr;
}
thx.core._Procedure = {}
thx.core._Procedure.ProcedureDefImpl = function() { }
thx.core._Procedure.ProcedureDefImpl.__name__ = ["thx","core","_Procedure","ProcedureDefImpl"];
thx.core._Procedure.ProcedureDefImpl._new = function(fun) {
	return fun;
}
thx.core._Procedure.ProcedureDefImpl.fromArity0 = function(fun) {
	return fun;
}
thx.core._Procedure.ProcedureDefImpl.fromArity1 = function(fun) {
	return fun;
}
thx.core._Procedure.ProcedureDefImpl.fromArity2 = function(fun) {
	return fun;
}
thx.core._Procedure.ProcedureDefImpl.fromArity3 = function(fun) {
	return fun;
}
thx.core._Procedure.ProcedureDefImpl.fromArity4 = function(fun) {
	return fun;
}
thx.core._Procedure.ProcedureDefImpl.fromArity5 = function(fun) {
	return fun;
}
thx.core._Procedure.ProcedureDefImpl.getFunction = function(this1) {
	return this1;
}
thx.core._Procedure.ProcedureDefImpl.apply = function(this1,args) {
	this1.apply(null,args);
}
thx.core._Procedure.ProcedureDefImpl.equal = function(this1,other) {
	return Reflect.compareMethods(this1,other);
}
thx.core._Procedure.ProcedureImpl = function() { }
thx.core._Procedure.ProcedureImpl.__name__ = ["thx","core","_Procedure","ProcedureImpl"];
thx.core._Procedure.ProcedureImpl._new = function(fun,arity) {
	return { fun : fun, arity : arity};
}
thx.core._Procedure.ProcedureImpl.fromArity0 = function(fun) {
	return { fun : fun, arity : 0};
}
thx.core._Procedure.ProcedureImpl.fromArity1 = function(fun) {
	return { fun : fun, arity : 1};
}
thx.core._Procedure.ProcedureImpl.fromArity2 = function(fun) {
	return { fun : fun, arity : 2};
}
thx.core._Procedure.ProcedureImpl.fromArity3 = function(fun) {
	return { fun : fun, arity : 3};
}
thx.core._Procedure.ProcedureImpl.fromArity4 = function(fun) {
	return { fun : fun, arity : 4};
}
thx.core._Procedure.ProcedureImpl.fromArity5 = function(fun) {
	return { fun : fun, arity : 5};
}
thx.core._Procedure.ProcedureImpl.toArity0 = function(this1) {
	if(this1.arity != 0) throw "this procedure has arity " + this1.arity + " but you are trying to use it with arity 0";
	return this1.fun;
}
thx.core._Procedure.ProcedureImpl.toArity1 = function(this1) {
	if(this1.arity != 1) throw "this procedure has arity " + this1.arity + " but you are trying to use it with arity 1";
	return this1.fun;
}
thx.core._Procedure.ProcedureImpl.toArity2 = function(this1) {
	if(this1.arity != 2) throw "this procedure has arity " + this1.arity + " but you are trying to use it with arity 2";
	return this1.fun;
}
thx.core._Procedure.ProcedureImpl.toArity3 = function(this1) {
	if(this1.arity != 3) throw "this procedure has arity " + this1.arity + " but you are trying to use it with arity 3";
	return this1.fun;
}
thx.core._Procedure.ProcedureImpl.toArity4 = function(this1) {
	if(this1.arity != 4) throw "this procedure has arity " + this1.arity + " but you are trying to use it with arity 4";
	return this1.fun;
}
thx.core._Procedure.ProcedureImpl.toArity5 = function(this1) {
	if(this1.arity != 5) throw "this procedure has arity " + this1.arity + " but you are trying to use it with arity 5";
	return this1.fun;
}
thx.core._Procedure.ProcedureImpl.getArity = function(this1) {
	return this1.arity;
}
thx.core._Procedure.ProcedureImpl.getFunction = function(this1) {
	return this1.fun;
}
thx.core._Procedure.ProcedureImpl.apply = function(this1,args) {
	if(args.length != this1.arity) throw "invalid number of arguments, expected " + this1.arity + " but was " + args.length;
	this1.fun.apply(null,args);
}
thx.core._Procedure.ProcedureImpl.equal = function(this1,other) {
	return Reflect.compareMethods(this1.fun,other.fun);
}
thx.core.Types = function() { }
thx.core.Types.__name__ = ["thx","core","Types"];
thx.core.ClassTypes = function() { }
thx.core.ClassTypes.__name__ = ["thx","core","ClassTypes"];
thx.core.ClassTypes.toString = function(cls) {
	return Type.getClassName(cls);
}
thx.core.ValueTypes = function() { }
thx.core.ValueTypes.__name__ = ["thx","core","ValueTypes"];
thx.core.ValueTypes.toString = function(type) {
	return (function($this) {
		var $r;
		var $e = (type);
		switch( $e[1] ) {
		case 1:
			$r = "Int";
			break;
		case 2:
			$r = "Float";
			break;
		case 3:
			$r = "Bool";
			break;
		case 4:
			$r = "Dynamic";
			break;
		case 5:
			$r = "Function";
			break;
		case 6:
			var type_eTClass_0 = $e[2];
			$r = Type.getClassName(type_eTClass_0);
			break;
		case 7:
			var type_eTEnum_0 = $e[2];
			$r = Type.getEnumName(type_eTEnum_0);
			break;
		default:
			$r = null;
		}
		return $r;
	}(this));
}
thx.core.ValueTypes.typeInheritance = function(type) {
	return (function($this) {
		var $r;
		var $e = (type);
		switch( $e[1] ) {
		case 1:
			$r = ["Int"];
			break;
		case 2:
			$r = ["Float"];
			break;
		case 3:
			$r = ["Bool"];
			break;
		case 4:
			$r = ["Dynamic"];
			break;
		case 5:
			$r = ["Function"];
			break;
		case 6:
			var type_eTClass_0 = $e[2];
			$r = (function($this) {
				var $r;
				var classes = [];
				while(null != type_eTClass_0) {
					classes.push(type_eTClass_0);
					type_eTClass_0 = Type.getSuperClass(type_eTClass_0);
				}
				$r = classes.map(Type.getClassName);
				return $r;
			}($this));
			break;
		case 7:
			var type_eTEnum_0 = $e[2];
			$r = [Type.getEnumName(type_eTEnum_0)];
			break;
		default:
			$r = null;
		}
		return $r;
	}(this));
}
thx.react = {}
thx.react.Binder = function() {
	this.map = new haxe.ds.StringMap();
};
thx.react.Binder.__name__ = ["thx","react","Binder"];
thx.react.Binder.prototype = {
	clear: function(names) {
		if(null == names) this.map = new haxe.ds.StringMap(); else {
			var _g = 0, _g1 = names.split(" ");
			while(_g < _g1.length) {
				var name = _g1[_g];
				++_g;
				this.map.remove(name);
			}
		}
	}
	,unbind: function(names,handler) {
		var _g = 0, _g1 = names.split(" ");
		while(_g < _g1.length) {
			var name = _g1[_g];
			++_g;
			if(null == handler) this.map.remove(name); else {
				var binds = this.map.get(name);
				if(null == binds) continue;
				binds.remove(handler);
			}
		}
	}
	,bindOne: function(names,handler) {
		var _g = this;
		var p = null;
		p = (function($this) {
			var $r;
			var fun = Reflect.makeVarArgs(function(args) {
				_g.unbind(names,p);
				if(args.length != handler.arity) throw "invalid number of arguments, expected " + handler.arity + " but was " + args.length;
				handler.fun.apply(null,args);
			});
			$r = { fun : fun, arity : handler.arity};
			return $r;
		}(this));
		this.bind(names,p);
	}
	,bind: function(names,handler) {
		var _g = 0, _g1 = names.split(" ");
		while(_g < _g1.length) {
			var name = _g1[_g];
			++_g;
			var binds = this.map.get(name);
			if(null == binds) this.map.set(name,binds = new thx.react.ds.ProcedureList());
			binds.add(handler);
		}
	}
	,dispatch: function(names,payload) {
		var list = null, len = payload.length;
		try {
			var _g = 0, _g1 = names.split(" ");
			while(_g < _g1.length) {
				var name = _g1[_g];
				++_g;
				list = this.map.get(name);
				if(null == list) continue;
				var $it0 = list.iterator();
				while( $it0.hasNext() ) {
					var handler = $it0.next();
					if(len == handler.arity) {
						if(payload.length != handler.arity) throw "invalid number of arguments, expected " + handler.arity + " but was " + payload.length;
						handler.fun.apply(null,payload);
					}
				}
			}
		} catch( e ) {
			if( js.Boot.__instanceof(e,thx.react.Propagation) ) {
			} else throw(e);
		}
	}
	,map: null
	,__class__: thx.react.Binder
}
thx.react.Dispatcher = function() {
	this.binder = new thx.react.Binder();
};
thx.react.Dispatcher.__name__ = ["thx","react","Dispatcher"];
thx.react.Dispatcher.combinedValueTypes = function(values) {
	var alltypes = [];
	var _g = 0;
	while(_g < values.length) {
		var value = values[_g];
		++_g;
		var type = Type["typeof"](value), types = thx.core.ValueTypes.typeInheritance(type);
		if(types[types.length - 1] != "Dynamic") types.push("Dynamic");
		alltypes.push(types);
	}
	return thx.core.Arrays.crossMulti(alltypes).map(function(a) {
		return a.join(";");
	}).join(" ");
}
thx.react.Dispatcher.prototype = {
	triggerDynamic: function(payloads) {
		var names = thx.react.Dispatcher.combinedValueTypes(payloads);
		this.binder.dispatch(names,payloads);
	}
	,clear: function(type,name) {
		if(null != type) this.binder.clear(Type.getClassName(type)); else if(null != name) this.binder.clear(name); else this.binder.clear();
	}
	,binder: null
	,__class__: thx.react.Dispatcher
}
thx.react.IObservable = function() { }
thx.react.IObservable.__name__ = ["thx","react","IObservable"];
thx.react.IObservable.prototype = {
	clear: null
	,detach: null
	,attach: null
	,__class__: thx.react.IObservable
}
thx.react.IObservable0 = function() { }
thx.react.IObservable0.__name__ = ["thx","react","IObservable0"];
thx.react.IObservable0.prototype = {
	clear: null
	,detach: null
	,attach: null
	,__class__: thx.react.IObservable0
}
thx.react.IObservables = function() { }
thx.react.IObservables.__name__ = ["thx","react","IObservables"];
thx.react.IObservables.addListener = function(observable,listener) {
	var observer = new thx.react.ObserverFunction(listener);
	observable.attach(observer);
	return observer;
}
thx.react.IObservables0 = function() { }
thx.react.IObservables0.__name__ = ["thx","react","IObservables0"];
thx.react.IObservables0.addListener = function(observable,listener) {
	var observer = new thx.react.ObserverFunction0(listener);
	observable.attach(observer);
	return observer;
}
thx.react.IObserver = function() { }
thx.react.IObserver.__name__ = ["thx","react","IObserver"];
thx.react.IObserver.prototype = {
	update: null
	,__class__: thx.react.IObserver
}
thx.react.IObserver0 = function() { }
thx.react.IObserver0.__name__ = ["thx","react","IObserver0"];
thx.react.IObserver0.prototype = {
	update: null
	,__class__: thx.react.IObserver0
}
thx.react.Observable = function() {
	this.observers = [];
};
thx.react.Observable.__name__ = ["thx","react","Observable"];
thx.react.Observable.__interfaces__ = [thx.react.IObservable];
thx.react.Observable.prototype = {
	notify: function(payload) {
		var _g = 0, _g1 = this.observers;
		while(_g < _g1.length) {
			var observer = _g1[_g];
			++_g;
			observer.update(payload);
		}
	}
	,clear: function() {
		this.observers = [];
	}
	,detach: function(observer) {
		HxOverrides.remove(this.observers,observer);
	}
	,attach: function(observer) {
		this.observers.push(observer);
	}
	,observers: null
	,__class__: thx.react.Observable
}
thx.react.Observable0 = function() {
	this.observers = [];
};
thx.react.Observable0.__name__ = ["thx","react","Observable0"];
thx.react.Observable0.__interfaces__ = [thx.react.IObservable0];
thx.react.Observable0.prototype = {
	notify: function() {
		var _g = 0, _g1 = this.observers;
		while(_g < _g1.length) {
			var observer = _g1[_g];
			++_g;
			observer.update();
		}
	}
	,clear: function() {
		this.observers = [];
	}
	,detach: function(observer) {
		HxOverrides.remove(this.observers,observer);
	}
	,attach: function(observer) {
		this.observers.push(observer);
	}
	,observers: null
	,__class__: thx.react.Observable0
}
thx.react.ObserverFunction = function(handler) {
	this.handler = handler;
};
thx.react.ObserverFunction.__name__ = ["thx","react","ObserverFunction"];
thx.react.ObserverFunction.__interfaces__ = [thx.react.IObserver];
thx.react.ObserverFunction.prototype = {
	update: function(payload) {
		this.handler(payload);
	}
	,handler: null
	,__class__: thx.react.ObserverFunction
}
thx.react.ObserverFunction0 = function(handler) {
	this.handler = handler;
};
thx.react.ObserverFunction0.__name__ = ["thx","react","ObserverFunction0"];
thx.react.ObserverFunction0.__interfaces__ = [thx.react.IObserver0];
thx.react.ObserverFunction0.prototype = {
	update: function() {
		this.handler();
	}
	,handler: null
	,__class__: thx.react.ObserverFunction0
}
thx.react.Promise = function() {
	this.state = thx.react.PromiseState.Idle;
	this.handlers_succcess = [];
	this.handlers_always = [];
};
thx.react.Promise.__name__ = ["thx","react","Promise"];
thx.react.Promise.value0 = function() {
	return new thx.react.Deferred0().resolve();
}
thx.react.Promise.value = function(v) {
	return new thx.react.Deferred().resolve(v);
}
thx.react.Promise.value2 = function(v1,v2) {
	return new thx.react.Deferred2().resolve(v1,v2);
}
thx.react.Promise.value3 = function(v1,v2,v3) {
	return new thx.react.Deferred3().resolve(v1,v2,v3);
}
thx.react.Promise.value4 = function(v1,v2,v3,v4) {
	return new thx.react.Deferred4().resolve(v1,v2,v3,v4);
}
thx.react.Promise.value5 = function(v1,v2,v3,v4,v5) {
	return new thx.react.Deferred5().resolve(v1,v2,v3,v4,v5);
}
thx.react.Promise.prototype = {
	toString: function() {
		return "Promise (handlers: " + this.handlers_succcess.length + ", state : " + Std.string(this.state) + ")";
	}
	,progress_impl: function(names,handler) {
		this.getProgressDispatcher().binder.bind(names,handler);
		return this.update();
	}
	,fail_impl: function(names,handler) {
		this.getErrorDispatcher().binder.bind(names,handler);
		return this.update();
	}
	,getProgressDispatcher: function() {
		if(null == this.progressDispatcher) this.progressDispatcher = new thx.react.Dispatcher();
		return this.progressDispatcher;
	}
	,getErrorDispatcher: function() {
		if(null == this.errorDispatcher) this.errorDispatcher = new thx.react.Dispatcher();
		return this.errorDispatcher;
	}
	,update: function() {
		var _g = this;
		var $e = (_g.state);
		switch( $e[1] ) {
		case 0:
			break;
		case 3:
			var _g_fstate_eSuccess_0 = $e[2];
			var handler_success, handler_always, empty_args = [];
			try {
				while(null != (handler_success = this.handlers_succcess.shift())) handler_success.apply(null,_g_fstate_eSuccess_0);
				while(null != (handler_always = this.handlers_always.shift())) handler_always.apply(null,empty_args);
			} catch( e ) {
				this.setState(thx.react.PromiseState.ProgressException([e]));
				this.update();
			}
			break;
		case 1:
			var _g_fstate_eFailure_0 = $e[2];
			if(null != this.errorDispatcher) {
				this.errorDispatcher.triggerDynamic(_g_fstate_eFailure_0);
				this.errorDispatcher = null;
			}
			var handler_always, empty_args = [];
			while(null != (handler_always = this.handlers_always.shift())) handler_always.apply(null,empty_args);
			break;
		case 2:
			var _g_fstate_eProgress_0 = $e[2];
			if(null != this.progressDispatcher) this.progressDispatcher.triggerDynamic(_g_fstate_eProgress_0);
			break;
		case 4:
			throw "ProgressException state should never be in the poll";
			break;
		}
		return this;
	}
	,setState: function(newstate) {
		var _g = this;
		var $e = (_g.state);
		switch( $e[1] ) {
		case 0:
			this.state = newstate;
			break;
		case 2:
			var _g_fstate_eProgress_0 = $e[2];
			switch( (newstate)[1] ) {
			case 2:
				this.state = newstate;
				break;
			default:
				throw "promise was already resolved/rejected, can't apply new state $newstate";
			}
			break;
		case 3:
			var _g_fstate_eSuccess_0 = $e[2];
			var $e = (newstate);
			switch( $e[1] ) {
			case 4:
				var newstate_eProgressException_0 = $e[2];
				this.state = thx.react.PromiseState.Failure(newstate_eProgressException_0);
				break;
			default:
				throw "promise was already resolved/rejected, can't apply new state $newstate";
			}
			break;
		default:
			throw "promise was already resolved/rejected, can't apply new state $newstate";
		}
		this.update();
		return this;
	}
	,always: function(handler) {
		this.handlers_always.push(handler);
		this.update();
		return this;
	}
	,then: function(success,failure) {
		this.handlers_succcess.push(success);
		if(null != failure) this.getErrorDispatcher().binder.bind("Dynamic",{ fun : failure, arity : 1});
		this.update();
		return this;
	}
	,isComplete: function() {
		return this.isResolved() || this.isFailure();
	}
	,isFailure: function() {
		return (function($this) {
			var $r;
			var _g = $this;
			$r = (function($this) {
				var $r;
				switch( (_g.state)[1] ) {
				case 1:
				case 4:
					$r = true;
					break;
				default:
					$r = false;
				}
				return $r;
			}($this));
			return $r;
		}(this));
	}
	,isResolved: function() {
		return (function($this) {
			var $r;
			var _g = $this;
			$r = (function($this) {
				var $r;
				switch( (_g.state)[1] ) {
				case 3:
					$r = true;
					break;
				default:
					$r = false;
				}
				return $r;
			}($this));
			return $r;
		}(this));
	}
	,progressDispatcher: null
	,errorDispatcher: null
	,state: null
	,handlers_always: null
	,handlers_succcess: null
	,__class__: thx.react.Promise
}
thx.react.PromiseState = { __ename__ : ["thx","react","PromiseState"], __constructs__ : ["Idle","Failure","Progress","Success","ProgressException"] }
thx.react.PromiseState.Idle = ["Idle",0];
thx.react.PromiseState.Idle.toString = $estr;
thx.react.PromiseState.Idle.__enum__ = thx.react.PromiseState;
thx.react.PromiseState.Failure = function(args) { var $x = ["Failure",1,args]; $x.__enum__ = thx.react.PromiseState; $x.toString = $estr; return $x; }
thx.react.PromiseState.Progress = function(args) { var $x = ["Progress",2,args]; $x.__enum__ = thx.react.PromiseState; $x.toString = $estr; return $x; }
thx.react.PromiseState.Success = function(args) { var $x = ["Success",3,args]; $x.__enum__ = thx.react.PromiseState; $x.toString = $estr; return $x; }
thx.react.PromiseState.ProgressException = function(error) { var $x = ["ProgressException",4,error]; $x.__enum__ = thx.react.PromiseState; $x.toString = $estr; return $x; }
thx.react.BaseDeferred = function() { }
thx.react.BaseDeferred.__name__ = ["thx","react","BaseDeferred"];
thx.react.BaseDeferred.prototype = {
	toString: function() {
		return "" + Type.getClassName(Type.getClass(this)).split(".").pop() + " with " + Std.string(this.promise);
	}
	,notify: function(data) {
		this.promise.setState(thx.react.PromiseState.Progress([data]));
		return this;
	}
	,reject: function(error) {
		return this.promise.setState(thx.react.PromiseState.Failure([error]));
	}
	,promise: null
	,__class__: thx.react.BaseDeferred
}
thx.react.Deferred0 = function() {
	this.promise = new thx.react.Promise();
};
thx.react.Deferred0.__name__ = ["thx","react","Deferred0"];
thx.react.Deferred0.pipe = function(promise,success) {
	var deferred = new thx.react.Deferred();
	promise.then(function() {
		success().then($bind(deferred,deferred.resolve));
	});
	return deferred.promise;
}
thx.react.Deferred0.await0 = function(promise,other) {
	var deferred = new thx.react.Deferred0();
	promise.then(function() {
		other.then(function() {
			deferred.resolve();
		});
	});
	return deferred.promise;
}
thx.react.Deferred0.await = function(promise,other) {
	var deferred = new thx.react.Deferred();
	promise.then(function() {
		other.then(function(v1) {
			deferred.resolve(v1);
		});
	});
	return deferred.promise;
}
thx.react.Deferred0.await2 = function(promise,other) {
	var deferred = new thx.react.Deferred2();
	promise.then(function() {
		other.then(function(v1,v2) {
			deferred.resolve(v1,v2);
		});
	});
	return deferred.promise;
}
thx.react.Deferred0.await3 = function(promise,other) {
	var deferred = new thx.react.Deferred3();
	promise.then(function() {
		other.then(function(v1,v2,v3) {
			deferred.resolve(v1,v2,v3);
		});
	});
	return deferred.promise;
}
thx.react.Deferred0.await4 = function(promise,other) {
	var deferred = new thx.react.Deferred4();
	promise.then(function() {
		other.then(function(v1,v2,v3,v4) {
			deferred.resolve(v1,v2,v3,v4);
		});
	});
	return deferred.promise;
}
thx.react.Deferred0.await5 = function(promise,other) {
	var deferred = new thx.react.Deferred5();
	promise.then(function() {
		other.then(function(v1,v2,v3,v4,v5) {
			deferred.resolve(v1,v2,v3,v4,v5);
		});
	});
	return deferred.promise;
}
thx.react.Deferred0.__super__ = thx.react.BaseDeferred;
thx.react.Deferred0.prototype = $extend(thx.react.BaseDeferred.prototype,{
	resolve: function() {
		return this.promise.setState(thx.react.PromiseState.Success([]));
	}
	,__class__: thx.react.Deferred0
});
thx.react.Deferred = function() {
	this.promise = new thx.react.Promise();
};
thx.react.Deferred.__name__ = ["thx","react","Deferred"];
thx.react.Deferred.pipe = function(promise,success) {
	var deferred = new thx.react.Deferred();
	promise.then(function(v) {
		success(v).then($bind(deferred,deferred.resolve));
	});
	return deferred.promise;
}
thx.react.Deferred.await0 = function(promise,other) {
	var deferred = new thx.react.Deferred();
	promise.then(function(v1) {
		other.then(function() {
			deferred.resolve(v1);
		});
	});
	return deferred.promise;
}
thx.react.Deferred.await = function(promise,other) {
	var deferred = new thx.react.Deferred2();
	promise.then(function(v1) {
		other.then(function(v2) {
			deferred.resolve(v1,v2);
		});
	});
	return deferred.promise;
}
thx.react.Deferred.await2 = function(promise,other) {
	var deferred = new thx.react.Deferred3();
	promise.then(function(v1) {
		other.then(function(v2,v3) {
			deferred.resolve(v1,v2,v3);
		});
	});
	return deferred.promise;
}
thx.react.Deferred.await3 = function(promise,other) {
	var deferred = new thx.react.Deferred4();
	promise.then(function(v1) {
		other.then(function(v2,v3,v4) {
			deferred.resolve(v1,v2,v3,v4);
		});
	});
	return deferred.promise;
}
thx.react.Deferred.await4 = function(promise,other) {
	var deferred = new thx.react.Deferred5();
	promise.then(function(v1) {
		other.then(function(v2,v3,v4,v5) {
			deferred.resolve(v1,v2,v3,v4,v5);
		});
	});
	return deferred.promise;
}
thx.react.Deferred.__super__ = thx.react.BaseDeferred;
thx.react.Deferred.prototype = $extend(thx.react.BaseDeferred.prototype,{
	resolve: function(v1) {
		return this.promise.setState(thx.react.PromiseState.Success([v1]));
	}
	,__class__: thx.react.Deferred
});
thx.react.Deferred2 = function() {
	this.promise = new thx.react.Promise();
};
thx.react.Deferred2.__name__ = ["thx","react","Deferred2"];
thx.react.Deferred2.pipe = function(promise,success) {
	var deferred = new thx.react.Deferred2();
	promise.then(function(v1,v2) {
		success(v1,v2).then($bind(deferred,deferred.resolve));
	});
	return deferred.promise;
}
thx.react.Deferred2.await0 = function(promise,other) {
	var deferred = new thx.react.Deferred2();
	promise.then(function(v1,v2) {
		other.then(function() {
			deferred.resolve(v1,v2);
		});
	});
	return deferred.promise;
}
thx.react.Deferred2.await = function(promise,other) {
	var deferred = new thx.react.Deferred3();
	promise.then(function(v1,v2) {
		other.then(function(v3) {
			deferred.resolve(v1,v2,v3);
		});
	});
	return deferred.promise;
}
thx.react.Deferred2.await2 = function(promise,other) {
	var deferred = new thx.react.Deferred4();
	promise.then(function(v1,v2) {
		other.then(function(v3,v4) {
			deferred.resolve(v1,v2,v3,v4);
		});
	});
	return deferred.promise;
}
thx.react.Deferred2.await3 = function(promise,other) {
	var deferred = new thx.react.Deferred5();
	promise.then(function(v1,v2) {
		other.then(function(v3,v4,v5) {
			deferred.resolve(v1,v2,v3,v4,v5);
		});
	});
	return deferred.promise;
}
thx.react.Deferred2.__super__ = thx.react.BaseDeferred;
thx.react.Deferred2.prototype = $extend(thx.react.BaseDeferred.prototype,{
	resolve: function(v1,v2) {
		return this.promise.setState(thx.react.PromiseState.Success([v1,v2]));
	}
	,__class__: thx.react.Deferred2
});
thx.react.Deferred3 = function() {
	this.promise = new thx.react.Promise();
};
thx.react.Deferred3.__name__ = ["thx","react","Deferred3"];
thx.react.Deferred3.pipe = function(promise,success) {
	var deferred = new thx.react.Deferred3();
	promise.then(function(v1,v2,v3) {
		success(v1,v2,v3).then($bind(deferred,deferred.resolve));
	});
	return deferred.promise;
}
thx.react.Deferred3.await0 = function(promise,other) {
	var deferred = new thx.react.Deferred3();
	promise.then(function(v1,v2,v3) {
		other.then(function() {
			deferred.resolve(v1,v2,v3);
		});
	});
	return deferred.promise;
}
thx.react.Deferred3.await = function(promise,other) {
	var deferred = new thx.react.Deferred4();
	promise.then(function(v1,v2,v3) {
		other.then(function(v4) {
			deferred.resolve(v1,v2,v3,v4);
		});
	});
	return deferred.promise;
}
thx.react.Deferred3.await1 = function(promise,other) {
	var deferred = new thx.react.Deferred5();
	promise.then(function(v1,v2,v3) {
		other.then(function(v4,v5) {
			deferred.resolve(v1,v2,v3,v4,v5);
		});
	});
	return deferred.promise;
}
thx.react.Deferred3.__super__ = thx.react.BaseDeferred;
thx.react.Deferred3.prototype = $extend(thx.react.BaseDeferred.prototype,{
	resolve: function(v1,v2,v3) {
		return this.promise.setState(thx.react.PromiseState.Success([v1,v2,v3]));
	}
	,__class__: thx.react.Deferred3
});
thx.react.Deferred4 = function() {
	this.promise = new thx.react.Promise();
};
thx.react.Deferred4.__name__ = ["thx","react","Deferred4"];
thx.react.Deferred4.pipe = function(promise,success) {
	var deferred = new thx.react.Deferred3();
	promise.then(function(v1,v2,v3,v4) {
		success(v1,v2,v3,v4).then($bind(deferred,deferred.resolve));
	});
	return deferred.promise;
}
thx.react.Deferred4.await0 = function(promise,other) {
	var deferred = new thx.react.Deferred4();
	promise.then(function(v1,v2,v3,v4) {
		other.then(function() {
			deferred.resolve(v1,v2,v3,v4);
		});
	});
	return deferred.promise;
}
thx.react.Deferred4.await = function(promise,other) {
	var deferred = new thx.react.Deferred5();
	promise.then(function(v1,v2,v3,v4) {
		other.then(function(v5) {
			deferred.resolve(v1,v2,v3,v4,v5);
		});
	});
	return deferred.promise;
}
thx.react.Deferred4.__super__ = thx.react.BaseDeferred;
thx.react.Deferred4.prototype = $extend(thx.react.BaseDeferred.prototype,{
	resolve: function(v1,v2,v3,v4) {
		return this.promise.setState(thx.react.PromiseState.Success([v1,v2,v3,v4]));
	}
	,__class__: thx.react.Deferred4
});
thx.react.Deferred5 = function() {
	this.promise = new thx.react.Promise();
};
thx.react.Deferred5.__name__ = ["thx","react","Deferred5"];
thx.react.Deferred5.pipe = function(promise,success) {
	var deferred = new thx.react.Deferred3();
	promise.then(function(v1,v2,v3,v4,v5) {
		success(v1,v2,v3,v4,v5).then($bind(deferred,deferred.resolve));
	});
	return deferred.promise;
}
thx.react.Deferred5.await = function(promise,other) {
	var deferred = new thx.react.Deferred5();
	promise.then(function(v1,v2,v3,v4,v5) {
		other.then(function() {
			deferred.resolve(v1,v2,v3,v4,v5);
		});
	});
	return deferred.promise;
}
thx.react.Deferred5.__super__ = thx.react.BaseDeferred;
thx.react.Deferred5.prototype = $extend(thx.react.BaseDeferred.prototype,{
	resolve: function(v1,v2,v3,v4,v5) {
		return this.promise.setState(thx.react.PromiseState.Success([v1,v2,v3,v4,v5]));
	}
	,__class__: thx.react.Deferred5
});
thx.react.Propagation = function() {
};
thx.react.Propagation.__name__ = ["thx","react","Propagation"];
thx.react.Propagation.cancel = function() {
	throw thx.react.Propagation.instance;
}
thx.react.Propagation.prototype = {
	__class__: thx.react.Propagation
}
thx.react.Provider = function() {
	this.providers = new haxe.ds.StringMap();
};
thx.react.Provider.__name__ = ["thx","react","Provider"];
thx.react.Provider.prototype = {
	getProvider: function(type) {
		var provider = this.providers.get(type);
		if(null == provider) this.providers.set(type,provider = new thx.react.Deferred());
		return provider;
	}
	,provide: function(data) {
		var type = thx.core.ValueTypes.toString(Type["typeof"](data)), provider = this.getProvider(type);
		if(provider.promise.isComplete()) this.providers.set(type,provider = new thx.react.Deferred());
		provider.resolve(data);
		return this;
	}
	,demand: function(type) {
		return this.getProvider(Type.getClassName(type)).promise;
	}
	,providers: null
	,__class__: thx.react.Provider
}
thx.react.Responder = function() {
	this.respondersMap = new haxe.ds.StringMap();
	this.requestsMap = new haxe.ds.StringMap();
};
thx.react.Responder.__name__ = ["thx","react","Responder"];
thx.react.Responder.prototype = {
	getKey: function(requestType,responseType) {
		return "" + requestType + ":" + responseType;
	}
	,update: function(requestType,responseType) {
		var key = this.getKey(requestType,responseType), requests = this.requestsMap.get(key), responders = this.respondersMap.get(key);
		if(null == requests || null == responders) return;
		var i = requests.length;
		while(--i >= 0) {
			var request = requests[i], promise = null;
			var _g = 0;
			while(_g < responders.length) {
				var responder = responders[_g];
				++_g;
				promise = responder(request.payload);
				if(null != promise) break;
			}
			if(null != promise) {
				requests.splice(i,1);
				promise.then(($_=request.deferred,$bind($_,$_.resolve))).fail_impl("Unknown<0>",{ fun : ($_=request.deferred,$bind($_,$_.reject)), arity : 1}).progress_impl("Unknown<0>",{ fun : ($_=request.deferred,$bind($_,$_.notify)), arity : 1});
			}
		}
	}
	,respond_impl: function(requestType,responseType,handler) {
		var key = this.getKey(requestType,responseType), arr = this.respondersMap.get(key);
		if(null == arr) this.respondersMap.set(key,arr = []);
		arr.push(handler);
		this.update(requestType,responseType);
	}
	,respond: function(handler,requestType,responseType) {
		var request = Type.getClassName(requestType), response = Type.getClassName(responseType);
		return this.respond_impl(request,response,handler);
	}
	,request_impl: function(requestType,responseType,payload) {
		var key = this.getKey(requestType,responseType), arr = this.requestsMap.get(key), deferred = new thx.react.Deferred();
		if(null == arr) this.requestsMap.set(key,arr = []);
		arr.unshift({ payload : payload, deferred : deferred});
		this.update(requestType,responseType);
		return deferred.promise;
	}
	,request: function(payload,responseType) {
		var request = thx.core.ValueTypes.toString(Type["typeof"](payload)), response = Type.getClassName(responseType);
		return this.request_impl(request,response,payload);
	}
	,requestsMap: null
	,respondersMap: null
	,__class__: thx.react.Responder
}
thx.react.ds = {}
thx.react.ds.ProcedureList = function() {
	this.a = [];
	this.iterators = new haxe.ds.IntMap();
};
thx.react.ds.ProcedureList.__name__ = ["thx","react","ds","ProcedureList"];
thx.react.ds.ProcedureList.prototype = {
	iterator: function() {
		var _g = this;
		var key = ++thx.react.ds.ProcedureList.iterator_id;
		this.iterators.set(key,0);
		return { next : function() {
			var index = _g.iterators.get(key);
			_g.iterators.set(key,index + 1);
			return _g.a[index];
		}, hasNext : function() {
			if(_g.iterators.exists(key) && _g.iterators.get(key) < _g.a.length) return true; else {
				_g.iterators.remove(key);
				return false;
			}
		}};
	}
	,updateIterators: function(i) {
		var index;
		var $it0 = this.iterators.keys();
		while( $it0.hasNext() ) {
			var key = $it0.next();
			index = this.iterators.get(key);
			if(i < index) this.iterators.set(key,index - 1);
		}
	}
	,remove: function(v) {
		var _g1 = 0, _g = this.a.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(Reflect.compareMethods(this.a[i].fun,v.fun)) {
				this.updateIterators(i);
				this.a.splice(i,1);
				return true;
			}
		}
		return false;
	}
	,add: function(item) {
		this.a.push(item);
	}
	,a: null
	,iterators: null
	,__class__: thx.react.ds.ProcedureList
}
var utest = {}
utest.Assert = function() { }
utest.Assert.__name__ = ["utest","Assert"];
utest.Assert.isTrue = function(cond,msg,pos) {
	if(utest.Assert.results == null) throw "Assert.results is not currently bound to any assert context";
	if(null == msg) msg = "expected true";
	if(cond) utest.Assert.results.add(utest.Assertation.Success(pos)); else utest.Assert.results.add(utest.Assertation.Failure(msg,pos));
}
utest.Assert.isFalse = function(value,msg,pos) {
	if(null == msg) msg = "expected false";
	utest.Assert.isTrue(value == false,msg,pos);
}
utest.Assert.isNull = function(value,msg,pos) {
	if(msg == null) msg = "expected null but was " + utest.Assert.q(value);
	utest.Assert.isTrue(value == null,msg,pos);
}
utest.Assert.notNull = function(value,msg,pos) {
	if(null == msg) msg = "expected false";
	utest.Assert.isTrue(value != null,msg,pos);
}
utest.Assert["is"] = function(value,type,msg,pos) {
	if(msg == null) msg = "expected type " + utest.Assert.typeToString(type) + " but was " + utest.Assert.typeToString(value);
	utest.Assert.isTrue(js.Boot.__instanceof(value,type),msg,pos);
}
utest.Assert.notEquals = function(expected,value,msg,pos) {
	if(msg == null) msg = "expected " + utest.Assert.q(expected) + " and testa value " + utest.Assert.q(value) + " should be different";
	utest.Assert.isFalse(expected == value,msg,pos);
}
utest.Assert.equals = function(expected,value,msg,pos) {
	if(msg == null) msg = "expected " + utest.Assert.q(expected) + " but was " + utest.Assert.q(value);
	utest.Assert.isTrue(expected == value,msg,pos);
}
utest.Assert.match = function(pattern,value,msg,pos) {
	if(msg == null) msg = "the value " + utest.Assert.q(value) + "does not match the provided pattern";
	utest.Assert.isTrue(pattern.match(value),msg,pos);
}
utest.Assert.floatEquals = function(expected,value,approx,msg,pos) {
	if(msg == null) msg = "expected " + utest.Assert.q(expected) + " but was " + utest.Assert.q(value);
	return utest.Assert.isTrue(utest.Assert._floatEquals(expected,value,approx),msg,pos);
}
utest.Assert._floatEquals = function(expected,value,approx) {
	if(Math.isNaN(expected)) return Math.isNaN(value); else if(Math.isNaN(value)) return false; else if(!Math.isFinite(expected) && !Math.isFinite(value)) return expected > 0 == value > 0;
	if(null == approx) approx = 1e-5;
	return Math.abs(value - expected) < approx;
}
utest.Assert.getTypeName = function(v) {
	var _g = Type["typeof"](v);
	var $e = (_g);
	switch( $e[1] ) {
	case 0:
		return "[null]";
	case 1:
		return "Int";
	case 2:
		return "Float";
	case 3:
		return "Bool";
	case 5:
		return "function";
	case 6:
		var _g_eTClass_0 = $e[2];
		return Type.getClassName(_g_eTClass_0);
	case 7:
		var _g_eTEnum_0 = $e[2];
		return Type.getEnumName(_g_eTEnum_0);
	case 4:
		return "Object";
	case 8:
		return "Unknown";
	}
}
utest.Assert.isIterable = function(v,isAnonym) {
	var fields = isAnonym?Reflect.fields(v):Type.getInstanceFields(Type.getClass(v));
	if(!Lambda.has(fields,"iterator")) return false;
	return Reflect.isFunction(Reflect.field(v,"iterator"));
}
utest.Assert.isIterator = function(v,isAnonym) {
	var fields = isAnonym?Reflect.fields(v):Type.getInstanceFields(Type.getClass(v));
	if(!Lambda.has(fields,"next") || !Lambda.has(fields,"hasNext")) return false;
	return Reflect.isFunction(Reflect.field(v,"next")) && Reflect.isFunction(Reflect.field(v,"hasNext"));
}
utest.Assert.sameAs = function(expected,value,status) {
	var texpected = utest.Assert.getTypeName(expected);
	var tvalue = utest.Assert.getTypeName(value);
	if(texpected != tvalue) {
		status.error = "expected type " + texpected + " but it is " + tvalue + (status.path == ""?"":" for field " + status.path);
		return false;
	}
	var _g = Type["typeof"](expected);
	var $e = (_g);
	switch( $e[1] ) {
	case 2:
		if(!utest.Assert._floatEquals(expected,value)) {
			status.error = "expected " + utest.Assert.q(expected) + " but it is " + utest.Assert.q(value) + (status.path == ""?"":" for field " + status.path);
			return false;
		}
		return true;
	case 0:
	case 1:
	case 3:
		if(expected != value) {
			status.error = "expected " + utest.Assert.q(expected) + " but it is " + utest.Assert.q(value) + (status.path == ""?"":" for field " + status.path);
			return false;
		}
		return true;
	case 5:
		if(!Reflect.compareMethods(expected,value)) {
			status.error = "expected same function reference" + (status.path == ""?"":" for field " + status.path);
			return false;
		}
		return true;
	case 6:
		var _g_eTClass_0 = $e[2];
		var cexpected = Type.getClassName(_g_eTClass_0);
		var cvalue = Type.getClassName(Type.getClass(value));
		if(cexpected != cvalue) {
			status.error = "expected instance of " + utest.Assert.q(cexpected) + " but it is " + utest.Assert.q(cvalue) + (status.path == ""?"":" for field " + status.path);
			return false;
		}
		if(js.Boot.__instanceof(expected,String) && expected != value) {
			status.error = "expected '" + Std.string(expected) + "' but it is '" + Std.string(value) + "'";
			return false;
		}
		if(js.Boot.__instanceof(expected,Array)) {
			if(status.recursive || status.path == "") {
				if(expected.length != value.length) {
					status.error = "expected " + Std.string(expected.length) + " elements but they were " + Std.string(value.length) + (status.path == ""?"":" for field " + status.path);
					return false;
				}
				var path = status.path;
				var _g2 = 0, _g1 = expected.length;
				while(_g2 < _g1) {
					var i = _g2++;
					status.path = path == ""?"array[" + i + "]":path + "[" + i + "]";
					if(!utest.Assert.sameAs(expected[i],value[i],status)) {
						status.error = "expected " + utest.Assert.q(expected) + " but it is " + utest.Assert.q(value) + (status.path == ""?"":" for field " + status.path);
						return false;
					}
				}
			}
			return true;
		}
		if(js.Boot.__instanceof(expected,Date)) {
			if(expected.getTime() != value.getTime()) {
				status.error = "expected " + utest.Assert.q(expected) + " but it is " + utest.Assert.q(value) + (status.path == ""?"":" for field " + status.path);
				return false;
			}
			return true;
		}
		if(js.Boot.__instanceof(expected,haxe.io.Bytes)) {
			if(status.recursive || status.path == "") {
				var ebytes = expected;
				var vbytes = value;
				if(ebytes.length != vbytes.length) return false;
				var _g2 = 0, _g1 = ebytes.length;
				while(_g2 < _g1) {
					var i = _g2++;
					if(ebytes.b[i] != vbytes.b[i]) {
						status.error = "expected byte " + ebytes.b[i] + " but wss " + ebytes.b[i] + (status.path == ""?"":" for field " + status.path);
						return false;
					}
				}
			}
			return true;
		}
		if(js.Boot.__instanceof(expected,haxe.ds.StringMap) || js.Boot.__instanceof(expected,haxe.ds.IntMap)) {
			if(status.recursive || status.path == "") {
				var keys = Lambda.array({ iterator : function() {
					return expected.keys();
				}});
				var vkeys = Lambda.array({ iterator : function() {
					return value.keys();
				}});
				if(keys.length != vkeys.length) {
					status.error = "expected " + keys.length + " keys but they were " + vkeys.length + (status.path == ""?"":" for field " + status.path);
					return false;
				}
				var path = status.path;
				var _g1 = 0;
				while(_g1 < keys.length) {
					var key = keys[_g1];
					++_g1;
					status.path = path == ""?"hash[" + key + "]":path + "[" + key + "]";
					if(!utest.Assert.sameAs(expected.get(key),value.get(key),status)) {
						status.error = "expected " + utest.Assert.q(expected) + " but it is " + utest.Assert.q(value) + (status.path == ""?"":" for field " + status.path);
						return false;
					}
				}
			}
			return true;
		}
		if(utest.Assert.isIterator(expected,false)) {
			if(status.recursive || status.path == "") {
				var evalues = Lambda.array({ iterator : function() {
					return expected;
				}});
				var vvalues = Lambda.array({ iterator : function() {
					return value;
				}});
				if(evalues.length != vvalues.length) {
					status.error = "expected " + evalues.length + " values in Iterator but they were " + vvalues.length + (status.path == ""?"":" for field " + status.path);
					return false;
				}
				var path = status.path;
				var _g2 = 0, _g1 = evalues.length;
				while(_g2 < _g1) {
					var i = _g2++;
					status.path = path == ""?"iterator[" + i + "]":path + "[" + i + "]";
					if(!utest.Assert.sameAs(evalues[i],vvalues[i],status)) {
						status.error = "expected " + utest.Assert.q(expected) + " but it is " + utest.Assert.q(value) + (status.path == ""?"":" for field " + status.path);
						return false;
					}
				}
			}
			return true;
		}
		if(utest.Assert.isIterable(expected,false)) {
			if(status.recursive || status.path == "") {
				var evalues = Lambda.array(expected);
				var vvalues = Lambda.array(value);
				if(evalues.length != vvalues.length) {
					status.error = "expected " + evalues.length + " values in Iterable but they were " + vvalues.length + (status.path == ""?"":" for field " + status.path);
					return false;
				}
				var path = status.path;
				var _g2 = 0, _g1 = evalues.length;
				while(_g2 < _g1) {
					var i = _g2++;
					status.path = path == ""?"iterable[" + i + "]":path + "[" + i + "]";
					if(!utest.Assert.sameAs(evalues[i],vvalues[i],status)) return false;
				}
			}
			return true;
		}
		if(status.recursive || status.path == "") {
			var fields = Type.getInstanceFields(Type.getClass(expected));
			var path = status.path;
			var _g1 = 0;
			while(_g1 < fields.length) {
				var field = fields[_g1];
				++_g1;
				status.path = path == ""?field:path + "." + field;
				var e = Reflect.field(expected,field);
				if(Reflect.isFunction(e)) continue;
				var v = Reflect.field(value,field);
				if(!utest.Assert.sameAs(e,v,status)) return false;
			}
		}
		return true;
	case 7:
		var _g_eTEnum_0 = $e[2];
		var eexpected = Type.getEnumName(_g_eTEnum_0);
		var evalue = Type.getEnumName(Type.getEnum(value));
		if(eexpected != evalue) {
			status.error = "expected enumeration of " + utest.Assert.q(eexpected) + " but it is " + utest.Assert.q(evalue) + (status.path == ""?"":" for field " + status.path);
			return false;
		}
		if(status.recursive || status.path == "") {
			if(Type.enumIndex(expected) != Type.enumIndex(value)) {
				status.error = "expected " + utest.Assert.q(Type.enumConstructor(expected)) + " but is " + utest.Assert.q(Type.enumConstructor(value)) + (status.path == ""?"":" for field " + status.path);
				return false;
			}
			var eparams = Type.enumParameters(expected);
			var vparams = Type.enumParameters(value);
			var path = status.path;
			var _g2 = 0, _g1 = eparams.length;
			while(_g2 < _g1) {
				var i = _g2++;
				status.path = path == ""?"enum[" + i + "]":path + "[" + i + "]";
				if(!utest.Assert.sameAs(eparams[i],vparams[i],status)) {
					status.error = "expected " + utest.Assert.q(expected) + " but it is " + utest.Assert.q(value) + (status.path == ""?"":" for field " + status.path);
					return false;
				}
			}
		}
		return true;
	case 4:
		if(status.recursive || status.path == "") {
			var tfields = Reflect.fields(value);
			var fields = Reflect.fields(expected);
			var path = status.path;
			var _g1 = 0;
			while(_g1 < fields.length) {
				var field = fields[_g1];
				++_g1;
				HxOverrides.remove(tfields,field);
				status.path = path == ""?field:path + "." + field;
				if(!Reflect.hasField(value,field)) {
					status.error = "expected field " + status.path + " does not exist in " + utest.Assert.q(value);
					return false;
				}
				var e = Reflect.field(expected,field);
				if(Reflect.isFunction(e)) continue;
				var v = Reflect.field(value,field);
				if(!utest.Assert.sameAs(e,v,status)) return false;
			}
			if(tfields.length > 0) {
				status.error = "the tested object has extra field(s) (" + tfields.join(", ") + ") not included in the expected ones";
				return false;
			}
		}
		if(utest.Assert.isIterator(expected,true)) {
			if(!utest.Assert.isIterator(value,true)) {
				status.error = "expected Iterable but it is not " + (status.path == ""?"":" for field " + status.path);
				return false;
			}
			if(status.recursive || status.path == "") {
				var evalues = Lambda.array({ iterator : function() {
					return expected;
				}});
				var vvalues = Lambda.array({ iterator : function() {
					return value;
				}});
				if(evalues.length != vvalues.length) {
					status.error = "expected " + evalues.length + " values in Iterator but they were " + vvalues.length + (status.path == ""?"":" for field " + status.path);
					return false;
				}
				var path = status.path;
				var _g2 = 0, _g1 = evalues.length;
				while(_g2 < _g1) {
					var i = _g2++;
					status.path = path == ""?"iterator[" + i + "]":path + "[" + i + "]";
					if(!utest.Assert.sameAs(evalues[i],vvalues[i],status)) {
						status.error = "expected " + utest.Assert.q(expected) + " but it is " + utest.Assert.q(value) + (status.path == ""?"":" for field " + status.path);
						return false;
					}
				}
			}
			return true;
		}
		if(utest.Assert.isIterable(expected,true)) {
			if(!utest.Assert.isIterable(value,true)) {
				status.error = "expected Iterator but it is not " + (status.path == ""?"":" for field " + status.path);
				return false;
			}
			if(status.recursive || status.path == "") {
				var evalues = Lambda.array(expected);
				var vvalues = Lambda.array(value);
				if(evalues.length != vvalues.length) {
					status.error = "expected " + evalues.length + " values in Iterable but they were " + vvalues.length + (status.path == ""?"":" for field " + status.path);
					return false;
				}
				var path = status.path;
				var _g2 = 0, _g1 = evalues.length;
				while(_g2 < _g1) {
					var i = _g2++;
					status.path = path == ""?"iterable[" + i + "]":path + "[" + i + "]";
					if(!utest.Assert.sameAs(evalues[i],vvalues[i],status)) return false;
				}
			}
			return true;
		}
		return true;
	case 8:
		return (function($this) {
			var $r;
			throw "Unable to compare two unknown types";
			return $r;
		}(this));
	}
	return (function($this) {
		var $r;
		throw "Unable to compare values: " + utest.Assert.q(expected) + " and " + utest.Assert.q(value);
		return $r;
	}(this));
}
utest.Assert.q = function(v) {
	if(js.Boot.__instanceof(v,String)) return "\"" + StringTools.replace(v,"\"","\\\"") + "\""; else return Std.string(v);
}
utest.Assert.same = function(expected,value,recursive,msg,pos) {
	var status = { recursive : null == recursive?true:recursive, path : "", error : null};
	if(utest.Assert.sameAs(expected,value,status)) utest.Assert.isTrue(true,msg,pos); else utest.Assert.fail(msg == null?status.error:msg,pos);
}
utest.Assert.raises = function(method,type,msgNotThrown,msgWrongType,pos) {
	if(type == null) type = String;
	try {
		method();
		var name = Type.getClassName(type);
		if(name == null) name = "" + Std.string(type);
		if(null == msgNotThrown) msgNotThrown = "exception of type " + name + " not raised";
		utest.Assert.fail(msgNotThrown,pos);
	} catch( ex ) {
		var name = Type.getClassName(type);
		if(name == null) name = "" + Std.string(type);
		if(null == msgWrongType) msgWrongType = "expected throw of type " + name + " but was " + Std.string(ex);
		utest.Assert.isTrue(js.Boot.__instanceof(ex,type),msgWrongType,pos);
	}
}
utest.Assert.allows = function(possibilities,value,msg,pos) {
	if(Lambda.has(possibilities,value)) utest.Assert.isTrue(true,msg,pos); else utest.Assert.fail(msg == null?"value " + utest.Assert.q(value) + " not found in the expected possibilities " + Std.string(possibilities):msg,pos);
}
utest.Assert.contains = function(match,values,msg,pos) {
	if(Lambda.has(values,match)) utest.Assert.isTrue(true,msg,pos); else utest.Assert.fail(msg == null?"values " + utest.Assert.q(values) + " do not contain " + Std.string(match):msg,pos);
}
utest.Assert.notContains = function(match,values,msg,pos) {
	if(!Lambda.has(values,match)) utest.Assert.isTrue(true,msg,pos); else utest.Assert.fail(msg == null?"values " + utest.Assert.q(values) + " do contain " + Std.string(match):msg,pos);
}
utest.Assert.stringContains = function(match,value,msg,pos) {
	if(value != null && value.indexOf(match) >= 0) utest.Assert.isTrue(true,msg,pos); else utest.Assert.fail(msg == null?"value " + utest.Assert.q(value) + " does not contain " + utest.Assert.q(match):msg,pos);
}
utest.Assert.stringSequence = function(sequence,value,msg,pos) {
	if(null == value) {
		utest.Assert.fail(msg == null?"null argument value":msg,pos);
		return;
	}
	var p = 0;
	var _g = 0;
	while(_g < sequence.length) {
		var s = sequence[_g];
		++_g;
		var p2 = value.indexOf(s,p);
		if(p2 < 0) {
			if(msg == null) {
				msg = "expected '" + s + "' after ";
				if(p > 0) {
					var cut = HxOverrides.substr(value,0,p);
					if(cut.length > 30) cut = "..." + HxOverrides.substr(cut,-27,null);
					msg += " '" + cut + "'";
				} else msg += " begin";
			}
			utest.Assert.fail(msg,pos);
			return;
		}
		p = p2 + s.length;
	}
	utest.Assert.isTrue(true,msg,pos);
}
utest.Assert.fail = function(msg,pos) {
	if(msg == null) msg = "failure expected";
	utest.Assert.isTrue(false,msg,pos);
}
utest.Assert.warn = function(msg) {
	utest.Assert.results.add(utest.Assertation.Warning(msg));
}
utest.Assert.createAsync = function(f,timeout) {
	return function() {
	};
}
utest.Assert.createEvent = function(f,timeout) {
	return function(e) {
	};
}
utest.Assert.typeToString = function(t) {
	try {
		var _t = Type.getClass(t);
		if(_t != null) t = _t;
	} catch( e ) {
	}
	try {
		return Type.getClassName(t);
	} catch( e ) {
	}
	try {
		var _t = Type.getEnum(t);
		if(_t != null) t = _t;
	} catch( e ) {
	}
	try {
		return Type.getEnumName(t);
	} catch( e ) {
	}
	try {
		return Std.string(Type["typeof"](t));
	} catch( e ) {
	}
	try {
		return Std.string(t);
	} catch( e ) {
	}
	return "<unable to retrieve type name>";
}
utest.Assertation = { __ename__ : ["utest","Assertation"], __constructs__ : ["Success","Failure","Error","SetupError","TeardownError","TimeoutError","AsyncError","Warning"] }
utest.Assertation.Success = function(pos) { var $x = ["Success",0,pos]; $x.__enum__ = utest.Assertation; $x.toString = $estr; return $x; }
utest.Assertation.Failure = function(msg,pos) { var $x = ["Failure",1,msg,pos]; $x.__enum__ = utest.Assertation; $x.toString = $estr; return $x; }
utest.Assertation.Error = function(e,stack) { var $x = ["Error",2,e,stack]; $x.__enum__ = utest.Assertation; $x.toString = $estr; return $x; }
utest.Assertation.SetupError = function(e,stack) { var $x = ["SetupError",3,e,stack]; $x.__enum__ = utest.Assertation; $x.toString = $estr; return $x; }
utest.Assertation.TeardownError = function(e,stack) { var $x = ["TeardownError",4,e,stack]; $x.__enum__ = utest.Assertation; $x.toString = $estr; return $x; }
utest.Assertation.TimeoutError = function(missedAsyncs,stack) { var $x = ["TimeoutError",5,missedAsyncs,stack]; $x.__enum__ = utest.Assertation; $x.toString = $estr; return $x; }
utest.Assertation.AsyncError = function(e,stack) { var $x = ["AsyncError",6,e,stack]; $x.__enum__ = utest.Assertation; $x.toString = $estr; return $x; }
utest.Assertation.Warning = function(msg) { var $x = ["Warning",7,msg]; $x.__enum__ = utest.Assertation; $x.toString = $estr; return $x; }
utest._Dispatcher = {}
utest._Dispatcher.EventException = { __ename__ : ["utest","_Dispatcher","EventException"], __constructs__ : ["StopPropagation"] }
utest._Dispatcher.EventException.StopPropagation = ["StopPropagation",0];
utest._Dispatcher.EventException.StopPropagation.toString = $estr;
utest._Dispatcher.EventException.StopPropagation.__enum__ = utest._Dispatcher.EventException;
utest.Dispatcher = function() {
	this.handlers = new Array();
};
utest.Dispatcher.__name__ = ["utest","Dispatcher"];
utest.Dispatcher.stop = function() {
	throw utest._Dispatcher.EventException.StopPropagation;
}
utest.Dispatcher.prototype = {
	has: function() {
		return this.handlers.length > 0;
	}
	,dispatch: function(e) {
		try {
			var list = this.handlers.slice();
			var _g = 0;
			while(_g < list.length) {
				var l = list[_g];
				++_g;
				l(e);
			}
			return true;
		} catch( exc ) {
			if( js.Boot.__instanceof(exc,utest._Dispatcher.EventException) ) {
				return false;
			} else throw(exc);
		}
	}
	,clear: function() {
		this.handlers = new Array();
	}
	,remove: function(h) {
		var _g1 = 0, _g = this.handlers.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(Reflect.compareMethods(this.handlers[i],h)) return this.handlers.splice(i,1)[0];
		}
		return null;
	}
	,add: function(h) {
		this.handlers.push(h);
		return h;
	}
	,handlers: null
	,__class__: utest.Dispatcher
}
utest.Notifier = function() {
	this.handlers = new Array();
};
utest.Notifier.__name__ = ["utest","Notifier"];
utest.Notifier.stop = function() {
	throw utest._Dispatcher.EventException.StopPropagation;
}
utest.Notifier.prototype = {
	has: function() {
		return this.handlers.length > 0;
	}
	,dispatch: function() {
		try {
			var list = this.handlers.slice();
			var _g = 0;
			while(_g < list.length) {
				var l = list[_g];
				++_g;
				l();
			}
			return true;
		} catch( exc ) {
			if( js.Boot.__instanceof(exc,utest._Dispatcher.EventException) ) {
				return false;
			} else throw(exc);
		}
	}
	,clear: function() {
		this.handlers = new Array();
	}
	,remove: function(h) {
		var _g1 = 0, _g = this.handlers.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(Reflect.compareMethods(this.handlers[i],h)) return this.handlers.splice(i,1)[0];
		}
		return null;
	}
	,add: function(h) {
		this.handlers.push(h);
		return h;
	}
	,handlers: null
	,__class__: utest.Notifier
}
utest.Runner = function() {
	this.fixtures = new Array();
	this.onProgress = new utest.Dispatcher();
	this.onStart = new utest.Dispatcher();
	this.onComplete = new utest.Dispatcher();
	this.length = 0;
};
utest.Runner.__name__ = ["utest","Runner"];
utest.Runner.prototype = {
	testComplete: function(h) {
		this.onProgress.dispatch({ result : utest.TestResult.ofHandler(h), done : this.pos, totals : this.length});
		this.runNext();
	}
	,runFixture: function(fixture) {
		var handler = new utest.TestHandler(fixture);
		handler.onComplete.add($bind(this,this.testComplete));
		handler.execute();
	}
	,runNext: function() {
		if(this.fixtures.length > this.pos) this.runFixture(this.fixtures[this.pos++]); else this.onComplete.dispatch(this);
	}
	,run: function() {
		this.pos = 0;
		this.onStart.dispatch(this);
		this.runNext();
	}
	,pos: null
	,isMethod: function(test,name) {
		try {
			return Reflect.isFunction(Reflect.field(test,name));
		} catch( e ) {
			return false;
		}
	}
	,getFixture: function(index) {
		return this.fixtures[index];
	}
	,addFixture: function(fixture) {
		this.fixtures.push(fixture);
		this.length++;
	}
	,addCase: function(test,setup,teardown,prefix,pattern) {
		if(prefix == null) prefix = "test";
		if(teardown == null) teardown = "teardown";
		if(setup == null) setup = "setup";
		if(!Reflect.isObject(test)) throw "can't add a null object as a test case";
		if(!this.isMethod(test,setup)) setup = null;
		if(!this.isMethod(test,teardown)) teardown = null;
		var fields = Type.getInstanceFields(Type.getClass(test));
		if(pattern == null) {
			var _g = 0;
			while(_g < fields.length) {
				var field = fields[_g];
				++_g;
				if(!StringTools.startsWith(field,prefix)) continue;
				if(!this.isMethod(test,field)) continue;
				this.addFixture(new utest.TestFixture(test,field,setup,teardown));
			}
		} else {
			var _g = 0;
			while(_g < fields.length) {
				var field = fields[_g];
				++_g;
				if(!pattern.match(field)) continue;
				if(!this.isMethod(test,field)) continue;
				this.addFixture(new utest.TestFixture(test,field,setup,teardown));
			}
		}
	}
	,length: null
	,onComplete: null
	,onStart: null
	,onProgress: null
	,fixtures: null
	,__class__: utest.Runner
}
utest.TestFixture = function(target,method,setup,teardown) {
	this.target = target;
	this.method = method;
	this.setup = setup;
	this.teardown = teardown;
};
utest.TestFixture.__name__ = ["utest","TestFixture"];
utest.TestFixture.prototype = {
	checkMethod: function(name,arg) {
		var field = Reflect.field(this.target,name);
		if(field == null) throw arg + " function " + name + " is not a field of target";
		if(!Reflect.isFunction(field)) throw arg + " function " + name + " is not a function";
	}
	,teardown: null
	,setup: null
	,method: null
	,target: null
	,__class__: utest.TestFixture
}
utest.TestHandler = function(fixture) {
	if(fixture == null) throw "fixture argument is null";
	this.fixture = fixture;
	this.results = new List();
	this.asyncStack = new List();
	this.onTested = new utest.Dispatcher();
	this.onTimeout = new utest.Dispatcher();
	this.onComplete = new utest.Dispatcher();
};
utest.TestHandler.__name__ = ["utest","TestHandler"];
utest.TestHandler.exceptionStack = function(pops) {
	if(pops == null) pops = 2;
	var stack = haxe.CallStack.exceptionStack();
	while(pops-- > 0) stack.pop();
	return stack;
}
utest.TestHandler.prototype = {
	completed: function() {
		try {
			this.executeMethod(this.fixture.teardown);
		} catch( e ) {
			this.results.add(utest.Assertation.TeardownError(e,utest.TestHandler.exceptionStack(2)));
		}
		this.unbindHandler();
		this.onComplete.dispatch(this);
	}
	,timeout: function() {
		this.results.add(utest.Assertation.TimeoutError(this.asyncStack.length,[]));
		this.onTimeout.dispatch(this);
		this.completed();
	}
	,tested: function() {
		if(this.results.length == 0) this.results.add(utest.Assertation.Warning("no assertions"));
		this.onTested.dispatch(this);
		this.completed();
	}
	,executeMethod: function(name) {
		if(name == null) return;
		this.bindHandler();
		Reflect.field(this.fixture.target,name).apply(this.fixture.target,[]);
	}
	,addEvent: function(f,timeout) {
		if(timeout == null) timeout = 250;
		this.asyncStack.add(f);
		var handler = this;
		this.setTimeout(timeout);
		return function(e) {
			if(!handler.asyncStack.remove(f)) {
				handler.results.add(utest.Assertation.AsyncError("event already executed",[]));
				return;
			}
			try {
				handler.bindHandler();
				f(e);
			} catch( e1 ) {
				handler.results.add(utest.Assertation.AsyncError(e1,utest.TestHandler.exceptionStack(0)));
			}
		};
	}
	,addAsync: function(f,timeout) {
		if(timeout == null) timeout = 250;
		if(null == f) f = function() {
		};
		this.asyncStack.add(f);
		var handler = this;
		this.setTimeout(timeout);
		return function() {
			if(!handler.asyncStack.remove(f)) {
				handler.results.add(utest.Assertation.AsyncError("method already executed",[]));
				return;
			}
			try {
				handler.bindHandler();
				f();
			} catch( e ) {
				handler.results.add(utest.Assertation.AsyncError(e,utest.TestHandler.exceptionStack(0)));
			}
		};
	}
	,unbindHandler: function() {
		utest.Assert.results = null;
		utest.Assert.createAsync = function(f,t) {
			return function() {
			};
		};
		utest.Assert.createEvent = function(f,t) {
			return function(e) {
			};
		};
	}
	,bindHandler: function() {
		utest.Assert.results = this.results;
		utest.Assert.createAsync = $bind(this,this.addAsync);
		utest.Assert.createEvent = $bind(this,this.addEvent);
	}
	,setTimeout: function(timeout) {
		var newexpire = haxe.Timer.stamp() + timeout / 1000;
		this.expireson = this.expireson == null?newexpire:newexpire > this.expireson?newexpire:this.expireson;
	}
	,expireson: null
	,checkTested: function() {
		if(this.expireson == null || this.asyncStack.length == 0) this.tested(); else if(haxe.Timer.stamp() > this.expireson) this.timeout(); else haxe.Timer.delay($bind(this,this.checkTested),10);
	}
	,execute: function() {
		try {
			this.executeMethod(this.fixture.setup);
			try {
				this.executeMethod(this.fixture.method);
			} catch( e ) {
				this.results.add(utest.Assertation.Error(e,utest.TestHandler.exceptionStack()));
			}
		} catch( e ) {
			this.results.add(utest.Assertation.SetupError(e,utest.TestHandler.exceptionStack()));
		}
		this.checkTested();
	}
	,onComplete: null
	,onTimeout: null
	,onTested: null
	,asyncStack: null
	,fixture: null
	,results: null
	,__class__: utest.TestHandler
}
utest.TestResult = function() {
};
utest.TestResult.__name__ = ["utest","TestResult"];
utest.TestResult.ofHandler = function(handler) {
	var r = new utest.TestResult();
	var path = Type.getClassName(Type.getClass(handler.fixture.target)).split(".");
	r.cls = path.pop();
	r.pack = path.join(".");
	r.method = handler.fixture.method;
	r.setup = handler.fixture.setup;
	r.teardown = handler.fixture.teardown;
	r.assertations = handler.results;
	return r;
}
utest.TestResult.prototype = {
	allOk: function() {
		try {
			var $it0 = this.assertations.iterator();
			while( $it0.hasNext() ) {
				var l = $it0.next();
				switch( (l)[1] ) {
				case 0:
					throw "__break__";
					break;
				default:
					return false;
				}
			}
		} catch( e ) { if( e != "__break__" ) throw e; }
		return true;
	}
	,assertations: null
	,teardown: null
	,setup: null
	,method: null
	,cls: null
	,pack: null
	,__class__: utest.TestResult
}
utest.ui = {}
utest.ui.Report = function() { }
utest.ui.Report.__name__ = ["utest","ui","Report"];
utest.ui.Report.create = function(runner,displaySuccessResults,headerDisplayMode) {
	var report;
	report = new utest.ui.text.HtmlReport(runner,null,true);
	if(null == displaySuccessResults) report.displaySuccessResults = utest.ui.common.SuccessResultsDisplayMode.ShowSuccessResultsWithNoErrors; else report.displaySuccessResults = displaySuccessResults;
	if(null == headerDisplayMode) report.displayHeader = utest.ui.common.HeaderDisplayMode.ShowHeaderWithResults; else report.displayHeader = headerDisplayMode;
	return report;
}
utest.ui.common = {}
utest.ui.common.ClassResult = function(className,setupName,teardownName) {
	this.fixtures = new haxe.ds.StringMap();
	this.className = className;
	this.setupName = setupName;
	this.hasSetup = setupName != null;
	this.teardownName = teardownName;
	this.hasTeardown = teardownName != null;
	this.methods = 0;
	this.stats = new utest.ui.common.ResultStats();
};
utest.ui.common.ClassResult.__name__ = ["utest","ui","common","ClassResult"];
utest.ui.common.ClassResult.prototype = {
	methodNames: function(errorsHavePriority) {
		if(errorsHavePriority == null) errorsHavePriority = true;
		var names = [];
		var $it0 = this.fixtures.keys();
		while( $it0.hasNext() ) {
			var name = $it0.next();
			names.push(name);
		}
		if(errorsHavePriority) {
			var me = this;
			names.sort(function(a,b) {
				var $as = me.get(a).stats;
				var bs = me.get(b).stats;
				if($as.hasErrors) return !bs.hasErrors?-1:$as.errors == bs.errors?Reflect.compare(a,b):Reflect.compare($as.errors,bs.errors); else if(bs.hasErrors) return 1; else if($as.hasFailures) return !bs.hasFailures?-1:$as.failures == bs.failures?Reflect.compare(a,b):Reflect.compare($as.failures,bs.failures); else if(bs.hasFailures) return 1; else if($as.hasWarnings) return !bs.hasWarnings?-1:$as.warnings == bs.warnings?Reflect.compare(a,b):Reflect.compare($as.warnings,bs.warnings); else if(bs.hasWarnings) return 1; else return Reflect.compare(a,b);
			});
		} else names.sort(function(a,b) {
			return Reflect.compare(a,b);
		});
		return names;
	}
	,exists: function(method) {
		return this.fixtures.exists(method);
	}
	,get: function(method) {
		return this.fixtures.get(method);
	}
	,add: function(result) {
		if(this.fixtures.exists(result.methodName)) throw "invalid duplicated fixture result";
		this.stats.wire(result.stats);
		this.methods++;
		this.fixtures.set(result.methodName,result);
	}
	,stats: null
	,methods: null
	,hasTeardown: null
	,hasSetup: null
	,teardownName: null
	,setupName: null
	,className: null
	,fixtures: null
	,__class__: utest.ui.common.ClassResult
}
utest.ui.common.FixtureResult = function(methodName) {
	this.methodName = methodName;
	this.list = new List();
	this.hasTestError = false;
	this.hasSetupError = false;
	this.hasTeardownError = false;
	this.hasTimeoutError = false;
	this.hasAsyncError = false;
	this.stats = new utest.ui.common.ResultStats();
};
utest.ui.common.FixtureResult.__name__ = ["utest","ui","common","FixtureResult"];
utest.ui.common.FixtureResult.prototype = {
	add: function(assertation) {
		this.list.add(assertation);
		switch( (assertation)[1] ) {
		case 0:
			this.stats.addSuccesses(1);
			break;
		case 1:
			this.stats.addFailures(1);
			break;
		case 2:
			this.stats.addErrors(1);
			break;
		case 3:
			this.stats.addErrors(1);
			this.hasSetupError = true;
			break;
		case 4:
			this.stats.addErrors(1);
			this.hasTeardownError = true;
			break;
		case 5:
			this.stats.addErrors(1);
			this.hasTimeoutError = true;
			break;
		case 6:
			this.stats.addErrors(1);
			this.hasAsyncError = true;
			break;
		case 7:
			this.stats.addWarnings(1);
			break;
		}
	}
	,iterator: function() {
		return this.list.iterator();
	}
	,list: null
	,stats: null
	,hasAsyncError: null
	,hasTimeoutError: null
	,hasTeardownError: null
	,hasSetupError: null
	,hasTestError: null
	,methodName: null
	,__class__: utest.ui.common.FixtureResult
}
utest.ui.common.HeaderDisplayMode = { __ename__ : ["utest","ui","common","HeaderDisplayMode"], __constructs__ : ["AlwaysShowHeader","NeverShowHeader","ShowHeaderWithResults"] }
utest.ui.common.HeaderDisplayMode.AlwaysShowHeader = ["AlwaysShowHeader",0];
utest.ui.common.HeaderDisplayMode.AlwaysShowHeader.toString = $estr;
utest.ui.common.HeaderDisplayMode.AlwaysShowHeader.__enum__ = utest.ui.common.HeaderDisplayMode;
utest.ui.common.HeaderDisplayMode.NeverShowHeader = ["NeverShowHeader",1];
utest.ui.common.HeaderDisplayMode.NeverShowHeader.toString = $estr;
utest.ui.common.HeaderDisplayMode.NeverShowHeader.__enum__ = utest.ui.common.HeaderDisplayMode;
utest.ui.common.HeaderDisplayMode.ShowHeaderWithResults = ["ShowHeaderWithResults",2];
utest.ui.common.HeaderDisplayMode.ShowHeaderWithResults.toString = $estr;
utest.ui.common.HeaderDisplayMode.ShowHeaderWithResults.__enum__ = utest.ui.common.HeaderDisplayMode;
utest.ui.common.SuccessResultsDisplayMode = { __ename__ : ["utest","ui","common","SuccessResultsDisplayMode"], __constructs__ : ["AlwaysShowSuccessResults","NeverShowSuccessResults","ShowSuccessResultsWithNoErrors"] }
utest.ui.common.SuccessResultsDisplayMode.AlwaysShowSuccessResults = ["AlwaysShowSuccessResults",0];
utest.ui.common.SuccessResultsDisplayMode.AlwaysShowSuccessResults.toString = $estr;
utest.ui.common.SuccessResultsDisplayMode.AlwaysShowSuccessResults.__enum__ = utest.ui.common.SuccessResultsDisplayMode;
utest.ui.common.SuccessResultsDisplayMode.NeverShowSuccessResults = ["NeverShowSuccessResults",1];
utest.ui.common.SuccessResultsDisplayMode.NeverShowSuccessResults.toString = $estr;
utest.ui.common.SuccessResultsDisplayMode.NeverShowSuccessResults.__enum__ = utest.ui.common.SuccessResultsDisplayMode;
utest.ui.common.SuccessResultsDisplayMode.ShowSuccessResultsWithNoErrors = ["ShowSuccessResultsWithNoErrors",2];
utest.ui.common.SuccessResultsDisplayMode.ShowSuccessResultsWithNoErrors.toString = $estr;
utest.ui.common.SuccessResultsDisplayMode.ShowSuccessResultsWithNoErrors.__enum__ = utest.ui.common.SuccessResultsDisplayMode;
utest.ui.common.IReport = function() { }
utest.ui.common.IReport.__name__ = ["utest","ui","common","IReport"];
utest.ui.common.IReport.prototype = {
	setHandler: null
	,displayHeader: null
	,displaySuccessResults: null
	,__class__: utest.ui.common.IReport
}
utest.ui.common.PackageResult = function(packageName) {
	this.packageName = packageName;
	this.classes = new haxe.ds.StringMap();
	this.packages = new haxe.ds.StringMap();
	this.stats = new utest.ui.common.ResultStats();
};
utest.ui.common.PackageResult.__name__ = ["utest","ui","common","PackageResult"];
utest.ui.common.PackageResult.prototype = {
	getOrCreatePackage: function(pack,flat,ref) {
		if(pack == null || pack == "") return ref;
		if(flat) {
			if(ref.existsPackage(pack)) return ref.getPackage(pack);
			var p = new utest.ui.common.PackageResult(pack);
			ref.addPackage(p);
			return p;
		} else {
			var parts = pack.split(".");
			var _g = 0;
			while(_g < parts.length) {
				var part = parts[_g];
				++_g;
				ref = this.getOrCreatePackage(part,true,ref);
			}
			return ref;
		}
	}
	,getOrCreateClass: function(pack,cls,setup,teardown) {
		if(pack.existsClass(cls)) return pack.getClass(cls);
		var c = new utest.ui.common.ClassResult(cls,setup,teardown);
		pack.addClass(c);
		return c;
	}
	,createFixture: function(method,assertations) {
		var f = new utest.ui.common.FixtureResult(method);
		var $it0 = $iterator(assertations)();
		while( $it0.hasNext() ) {
			var assertation = $it0.next();
			f.add(assertation);
		}
		return f;
	}
	,packageNames: function(errorsHavePriority) {
		if(errorsHavePriority == null) errorsHavePriority = true;
		var names = [];
		if(this.packageName == null) names.push("");
		var $it0 = this.packages.keys();
		while( $it0.hasNext() ) {
			var name = $it0.next();
			names.push(name);
		}
		if(errorsHavePriority) {
			var me = this;
			names.sort(function(a,b) {
				var $as = me.getPackage(a).stats;
				var bs = me.getPackage(b).stats;
				if($as.hasErrors) return !bs.hasErrors?-1:$as.errors == bs.errors?Reflect.compare(a,b):Reflect.compare($as.errors,bs.errors); else if(bs.hasErrors) return 1; else if($as.hasFailures) return !bs.hasFailures?-1:$as.failures == bs.failures?Reflect.compare(a,b):Reflect.compare($as.failures,bs.failures); else if(bs.hasFailures) return 1; else if($as.hasWarnings) return !bs.hasWarnings?-1:$as.warnings == bs.warnings?Reflect.compare(a,b):Reflect.compare($as.warnings,bs.warnings); else if(bs.hasWarnings) return 1; else return Reflect.compare(a,b);
			});
		} else names.sort(function(a,b) {
			return Reflect.compare(a,b);
		});
		return names;
	}
	,classNames: function(errorsHavePriority) {
		if(errorsHavePriority == null) errorsHavePriority = true;
		var names = [];
		var $it0 = this.classes.keys();
		while( $it0.hasNext() ) {
			var name = $it0.next();
			names.push(name);
		}
		if(errorsHavePriority) {
			var me = this;
			names.sort(function(a,b) {
				var $as = me.getClass(a).stats;
				var bs = me.getClass(b).stats;
				if($as.hasErrors) return !bs.hasErrors?-1:$as.errors == bs.errors?Reflect.compare(a,b):Reflect.compare($as.errors,bs.errors); else if(bs.hasErrors) return 1; else if($as.hasFailures) return !bs.hasFailures?-1:$as.failures == bs.failures?Reflect.compare(a,b):Reflect.compare($as.failures,bs.failures); else if(bs.hasFailures) return 1; else if($as.hasWarnings) return !bs.hasWarnings?-1:$as.warnings == bs.warnings?Reflect.compare(a,b):Reflect.compare($as.warnings,bs.warnings); else if(bs.hasWarnings) return 1; else return Reflect.compare(a,b);
			});
		} else names.sort(function(a,b) {
			return Reflect.compare(a,b);
		});
		return names;
	}
	,getClass: function(name) {
		return this.classes.get(name);
	}
	,getPackage: function(name) {
		if(this.packageName == null && name == "") return this;
		return this.packages.get(name);
	}
	,existsClass: function(name) {
		return this.classes.exists(name);
	}
	,existsPackage: function(name) {
		return this.packages.exists(name);
	}
	,addPackage: function(result) {
		this.packages.set(result.packageName,result);
		this.stats.wire(result.stats);
	}
	,addClass: function(result) {
		this.classes.set(result.className,result);
		this.stats.wire(result.stats);
	}
	,addResult: function(result,flattenPackage) {
		var pack = this.getOrCreatePackage(result.pack,flattenPackage,this);
		var cls = this.getOrCreateClass(pack,result.cls,result.setup,result.teardown);
		var fix = this.createFixture(result.method,result.assertations);
		cls.add(fix);
	}
	,stats: null
	,packages: null
	,classes: null
	,packageName: null
	,__class__: utest.ui.common.PackageResult
}
utest.ui.common.ReportTools = function() { }
utest.ui.common.ReportTools.__name__ = ["utest","ui","common","ReportTools"];
utest.ui.common.ReportTools.hasHeader = function(report,stats) {
	switch( (report.displayHeader)[1] ) {
	case 1:
		return false;
	case 2:
		if(!stats.isOk) return true;
		switch( (report.displaySuccessResults)[1] ) {
		case 1:
			return false;
		case 0:
		case 2:
			return true;
		}
		break;
	case 0:
		return true;
	}
}
utest.ui.common.ReportTools.skipResult = function(report,stats,isOk) {
	if(!stats.isOk) return false;
	return (function($this) {
		var $r;
		switch( (report.displaySuccessResults)[1] ) {
		case 1:
			$r = true;
			break;
		case 0:
			$r = false;
			break;
		case 2:
			$r = !isOk;
			break;
		}
		return $r;
	}(this));
}
utest.ui.common.ReportTools.hasOutput = function(report,stats) {
	if(!stats.isOk) return true;
	return utest.ui.common.ReportTools.hasHeader(report,stats);
}
utest.ui.common.ResultAggregator = function(runner,flattenPackage) {
	if(flattenPackage == null) flattenPackage = false;
	if(runner == null) throw "runner argument is null";
	this.flattenPackage = flattenPackage;
	this.runner = runner;
	runner.onStart.add($bind(this,this.start));
	runner.onProgress.add($bind(this,this.progress));
	runner.onComplete.add($bind(this,this.complete));
	this.onStart = new utest.Notifier();
	this.onComplete = new utest.Dispatcher();
	this.onProgress = new utest.Dispatcher();
};
utest.ui.common.ResultAggregator.__name__ = ["utest","ui","common","ResultAggregator"];
utest.ui.common.ResultAggregator.prototype = {
	complete: function(runner) {
		this.onComplete.dispatch(this.root);
	}
	,progress: function(e) {
		this.root.addResult(e.result,this.flattenPackage);
		this.onProgress.dispatch(e);
	}
	,createFixture: function(result) {
		var f = new utest.ui.common.FixtureResult(result.method);
		var $it0 = result.assertations.iterator();
		while( $it0.hasNext() ) {
			var assertation = $it0.next();
			f.add(assertation);
		}
		return f;
	}
	,getOrCreateClass: function(pack,cls,setup,teardown) {
		if(pack.existsClass(cls)) return pack.getClass(cls);
		var c = new utest.ui.common.ClassResult(cls,setup,teardown);
		pack.addClass(c);
		return c;
	}
	,getOrCreatePackage: function(pack,flat,ref) {
		if(ref == null) ref = this.root;
		if(pack == null || pack == "") return ref;
		if(flat) {
			if(ref.existsPackage(pack)) return ref.getPackage(pack);
			var p = new utest.ui.common.PackageResult(pack);
			ref.addPackage(p);
			return p;
		} else {
			var parts = pack.split(".");
			var _g = 0;
			while(_g < parts.length) {
				var part = parts[_g];
				++_g;
				ref = this.getOrCreatePackage(part,true,ref);
			}
			return ref;
		}
	}
	,start: function(runner) {
		this.root = new utest.ui.common.PackageResult(null);
		this.onStart.dispatch();
	}
	,onProgress: null
	,onComplete: null
	,onStart: null
	,root: null
	,flattenPackage: null
	,runner: null
	,__class__: utest.ui.common.ResultAggregator
}
utest.ui.common.ResultStats = function() {
	this.assertations = 0;
	this.successes = 0;
	this.failures = 0;
	this.errors = 0;
	this.warnings = 0;
	this.isOk = true;
	this.hasFailures = false;
	this.hasErrors = false;
	this.hasWarnings = false;
	this.onAddSuccesses = new utest.Dispatcher();
	this.onAddFailures = new utest.Dispatcher();
	this.onAddErrors = new utest.Dispatcher();
	this.onAddWarnings = new utest.Dispatcher();
};
utest.ui.common.ResultStats.__name__ = ["utest","ui","common","ResultStats"];
utest.ui.common.ResultStats.prototype = {
	unwire: function(dependant) {
		dependant.onAddSuccesses.remove($bind(this,this.addSuccesses));
		dependant.onAddFailures.remove($bind(this,this.addFailures));
		dependant.onAddErrors.remove($bind(this,this.addErrors));
		dependant.onAddWarnings.remove($bind(this,this.addWarnings));
		this.subtract(dependant);
	}
	,wire: function(dependant) {
		dependant.onAddSuccesses.add($bind(this,this.addSuccesses));
		dependant.onAddFailures.add($bind(this,this.addFailures));
		dependant.onAddErrors.add($bind(this,this.addErrors));
		dependant.onAddWarnings.add($bind(this,this.addWarnings));
		this.sum(dependant);
	}
	,subtract: function(other) {
		this.addSuccesses(-other.successes);
		this.addFailures(-other.failures);
		this.addErrors(-other.errors);
		this.addWarnings(-other.warnings);
	}
	,sum: function(other) {
		this.addSuccesses(other.successes);
		this.addFailures(other.failures);
		this.addErrors(other.errors);
		this.addWarnings(other.warnings);
	}
	,addWarnings: function(v) {
		if(v == 0) return;
		this.assertations += v;
		this.warnings += v;
		this.hasWarnings = this.warnings > 0;
		this.isOk = !(this.hasFailures || this.hasErrors || this.hasWarnings);
		this.onAddWarnings.dispatch(v);
	}
	,addErrors: function(v) {
		if(v == 0) return;
		this.assertations += v;
		this.errors += v;
		this.hasErrors = this.errors > 0;
		this.isOk = !(this.hasFailures || this.hasErrors || this.hasWarnings);
		this.onAddErrors.dispatch(v);
	}
	,addFailures: function(v) {
		if(v == 0) return;
		this.assertations += v;
		this.failures += v;
		this.hasFailures = this.failures > 0;
		this.isOk = !(this.hasFailures || this.hasErrors || this.hasWarnings);
		this.onAddFailures.dispatch(v);
	}
	,addSuccesses: function(v) {
		if(v == 0) return;
		this.assertations += v;
		this.successes += v;
		this.onAddSuccesses.dispatch(v);
	}
	,hasWarnings: null
	,hasErrors: null
	,hasFailures: null
	,isOk: null
	,onAddWarnings: null
	,onAddErrors: null
	,onAddFailures: null
	,onAddSuccesses: null
	,warnings: null
	,errors: null
	,failures: null
	,successes: null
	,assertations: null
	,__class__: utest.ui.common.ResultStats
}
utest.ui.text = {}
utest.ui.text.HtmlReport = function(runner,outputHandler,traceRedirected) {
	if(traceRedirected == null) traceRedirected = true;
	this.aggregator = new utest.ui.common.ResultAggregator(runner,true);
	runner.onStart.add($bind(this,this.start));
	this.aggregator.onComplete.add($bind(this,this.complete));
	if(null == outputHandler) this.setHandler($bind(this,this._handler)); else this.setHandler(outputHandler);
	if(traceRedirected) this.redirectTrace();
	this.displaySuccessResults = utest.ui.common.SuccessResultsDisplayMode.AlwaysShowSuccessResults;
	this.displayHeader = utest.ui.common.HeaderDisplayMode.AlwaysShowHeader;
};
utest.ui.text.HtmlReport.__name__ = ["utest","ui","text","HtmlReport"];
utest.ui.text.HtmlReport.__interfaces__ = [utest.ui.common.IReport];
utest.ui.text.HtmlReport.prototype = {
	_handler: function(report) {
		var isDef = function(v) {
			return typeof v != 'undefined';
		};
		var head = js.Browser.document.getElementsByTagName("head")[0];
		var script = js.Browser.document.createElement("script");
		script.type = "text/javascript";
		var sjs = report.jsScript();
		if(isDef(script.text)) script.text = sjs; else script.innerHTML = sjs;
		head.appendChild(script);
		var style = js.Browser.document.createElement("style");
		style.type = "text/css";
		var scss = report.cssStyle();
		if(isDef(style.styleSheet)) style.styleSheet.cssText = scss; else if(isDef(style.cssText)) style.cssText = scss; else if(isDef(style.innerText)) style.innerText = scss; else style.innerHTML = scss;
		head.appendChild(style);
		var el = js.Browser.document.getElementById("utest-results");
		if(null == el) {
			el = js.Browser.document.createElement("div");
			el.id = "utest-results";
			js.Browser.document.body.appendChild(el);
		}
		el.innerHTML = report.getAll();
	}
	,wrapHtml: function(title,s) {
		return "<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html;charset=utf-8\" />\n<title>" + title + "</title>\n\t\t\t<style type=\"text/css\">" + this.cssStyle() + "</style>\n\t\t\t<script type=\"text/javascript\">\n" + this.jsScript() + "\n</script>\n</head>\n\t\t\t<body>\n" + s + "\n</body>\n</html>";
	}
	,jsScript: function() {
		return "function utestTooltip(ref, text) {\n\tvar el = document.getElementById(\"utesttip\");\n\tif(!el) {\n\t\tvar el = document.createElement(\"div\")\n\t\tel.id = \"utesttip\";\n\t\tel.style.position = \"absolute\";\n\t\tdocument.body.appendChild(el)\n\t}\n\tvar p = utestFindPos(ref);\n\tel.style.left = (4 + p[0]) + \"px\";\n\tel.style.top = (p[1] - 1) + \"px\";\n\tel.innerHTML =  text;\n}\n\nfunction utestFindPos(el) {\n\tvar left = 0;\n\tvar top = 0;\n\tdo {\n\t\tleft += el.offsetLeft;\n\t\ttop += el.offsetTop;\n\t} while(el = el.offsetParent)\n\treturn [left, top];\n}\n\nfunction utestRemoveTooltip() {\n\tvar el = document.getElementById(\"utesttip\")\n\tif(el)\n\t\tdocument.body.removeChild(el)\n}";
	}
	,cssStyle: function() {
		return "body, dd, dt {\n\tfont-family: Verdana, Arial, Sans-serif;\n\tfont-size: 12px;\n}\ndl {\n\twidth: 180px;\n}\ndd, dt {\n\tmargin : 0;\n\tpadding : 2px 5px;\n\tborder-top: 1px solid #f0f0f0;\n\tborder-left: 1px solid #f0f0f0;\n\tborder-right: 1px solid #CCCCCC;\n\tborder-bottom: 1px solid #CCCCCC;\n}\ndd.value {\n\ttext-align: center;\n\tbackground-color: #eeeeee;\n}\ndt {\n\ttext-align: left;\n\tbackground-color: #e6e6e6;\n\tfloat: left;\n\twidth: 100px;\n}\n\nh1, h2, h3, h4, h5, h6 {\n\tmargin: 0;\n\tpadding: 0;\n}\n\nh1 {\n\ttext-align: center;\n\tfont-weight: bold;\n\tpadding: 5px 0 4px 0;\n\tfont-family: Arial, Sans-serif;\n\tfont-size: 18px;\n\tborder-top: 1px solid #f0f0f0;\n\tborder-left: 1px solid #f0f0f0;\n\tborder-right: 1px solid #CCCCCC;\n\tborder-bottom: 1px solid #CCCCCC;\n\tmargin: 0 2px 0px 2px;\n}\n\nh2 {\n\tfont-weight: bold;\n\tpadding: 2px 0 2px 8px;\n\tfont-family: Arial, Sans-serif;\n\tfont-size: 13px;\n\tborder-top: 1px solid #f0f0f0;\n\tborder-left: 1px solid #f0f0f0;\n\tborder-right: 1px solid #CCCCCC;\n\tborder-bottom: 1px solid #CCCCCC;\n\tmargin: 0 0 0px 0;\n\tbackground-color: #FFFFFF;\n\tcolor: #777777;\n}\n\nh2.classname {\n\tcolor: #000000;\n}\n\n.okbg {\n\tbackground-color: #66FF55;\n}\n.errorbg {\n\tbackground-color: #CC1100;\n}\n.failurebg {\n\tbackground-color: #EE3322;\n}\n.warnbg {\n\tbackground-color: #FFCC99;\n}\n.headerinfo {\n\ttext-align: right;\n\tfont-size: 11px;\n\tfont - color: 0xCCCCCC;\n\tmargin: 0 2px 5px 2px;\n\tborder-left: 1px solid #f0f0f0;\n\tborder-right: 1px solid #CCCCCC;\n\tborder-bottom: 1px solid #CCCCCC;\n\tpadding: 2px;\n}\n\nli {\n\tpadding: 4px;\n\tmargin: 2px;\n\tborder-top: 1px solid #f0f0f0;\n\tborder-left: 1px solid #f0f0f0;\n\tborder-right: 1px solid #CCCCCC;\n\tborder-bottom: 1px solid #CCCCCC;\n\tbackground-color: #e6e6e6;\n}\n\nli.fixture {\n\tbackground-color: #f6f6f6;\n\tpadding-bottom: 6px;\n}\n\ndiv.fixturedetails {\n\tpadding-left: 108px;\n}\n\nul {\n\tpadding: 0;\n\tmargin: 6px 0 0 0;\n\tlist-style-type: none;\n}\n\nol {\n\tpadding: 0 0 0 28px;\n\tmargin: 0px 0 0 0;\n}\n\n.statnumbers {\n\tpadding: 2px 8px;\n}\n\n.fixtureresult {\n\twidth: 100px;\n\ttext-align: center;\n\tdisplay: block;\n\tfloat: left;\n\tfont-weight: bold;\n\tpadding: 1px;\n\tmargin: 0 0 0 0;\n}\n\n.testoutput {\n\tborder: 1px dashed #CCCCCC;\n\tmargin: 4px 0 0 0;\n\tpadding: 4px 8px;\n\tbackground-color: #eeeeee;\n}\n\nspan.tracepos, span.traceposempty {\n\tdisplay: block;\n\tfloat: left;\n\tfont-weight: bold;\n\tfont-size: 9px;\n\twidth: 170px;\n\tmargin: 2px 0 0 2px;\n}\n\nspan.tracepos:hover {\n\tcursor : pointer;\n\tbackground-color: #ffff99;\n}\n\nspan.tracemsg {\n\tdisplay: block;\n\tmargin-left: 180px;\n\tbackground-color: #eeeeee;\n\tpadding: 7px;\n}\n\nspan.tracetime {\n\tdisplay: block;\n\tfloat: right;\n\tmargin: 2px;\n\tfont-size: 9px;\n\tcolor: #777777;\n}\n\n\ndiv.trace ol {\n\tpadding: 0 0 0 40px;\n\tcolor: #777777;\n}\n\ndiv.trace li {\n\tpadding: 0;\n}\n\ndiv.trace li div.li {\n\tcolor: #000000;\n}\n\ndiv.trace h2 {\n\tmargin: 0 2px 0px 2px;\n\tpadding-left: 4px;\n}\n\n.tracepackage {\n\tcolor: #777777;\n\tfont-weight: normal;\n}\n\n.clr {\n\tclear: both;\n}\n\n#utesttip {\n\tmargin-top: -3px;\n\tmargin-left: 170px;\n\tfont-size: 9px;\n}\n\n#utesttip li {\n\tmargin: 0;\n\tbackground-color: #ffff99;\n\tpadding: 2px 4px;\n\tborder: 0;\n\tborder-bottom: 1px dashed #ffff33;\n}";
	}
	,formatTime: function(t) {
		return Math.round(t * 1000) + " ms";
	}
	,complete: function(result) {
		this.result = result;
		this.handler(this);
		this.restoreTrace();
	}
	,result: null
	,getHtml: function(title) {
		if(null == title) title = "utest: " + utest.ui.text.HtmlReport.platform;
		var s = this.getAll();
		if("" == s) return ""; else return this.wrapHtml(title,s);
	}
	,getAll: function() {
		if(!utest.ui.common.ReportTools.hasOutput(this,this.result.stats)) return ""; else return this.getHeader() + this.getTrace() + this.getResults();
	}
	,getResults: function() {
		var buf = new StringBuf();
		this.addPackages(buf,this.result,this.result.stats.isOk);
		return buf.b;
	}
	,getTrace: function() {
		var buf = new StringBuf();
		if(this._traces == null || this._traces.length == 0) return "";
		buf.b += "<div class=\"trace\"><h2>traces</h2><ol>";
		var _g = 0, _g1 = this._traces;
		while(_g < _g1.length) {
			var t = _g1[_g];
			++_g;
			buf.b += "<li><div class=\"li\">";
			var stack = StringTools.replace(this.formatStack(t.stack,false),"'","\\'");
			var method = "<span class=\"tracepackage\">" + t.infos.className + "</span><br/>" + t.infos.methodName + "(" + t.infos.lineNumber + ")";
			buf.b += Std.string("<span class=\"tracepos\" onmouseover=\"utestTooltip(this.parentNode, '" + stack + "')\" onmouseout=\"utestRemoveTooltip()\">");
			buf.b += Std.string(method);
			buf.b += "</span><span class=\"tracetime\">";
			buf.b += Std.string("@ " + this.formatTime(t.time));
			if(Math.round(t.delta * 1000) > 0) buf.b += Std.string(", ~" + this.formatTime(t.delta));
			buf.b += "</span><span class=\"tracemsg\">";
			buf.b += Std.string(StringTools.replace(StringTools.trim(t.msg),"\n","<br/>\n"));
			buf.b += "</span><div class=\"clr\"></div></div></li>";
		}
		buf.b += "</ol></div>";
		return buf.b;
	}
	,getHeader: function() {
		var buf = new StringBuf();
		if(!utest.ui.common.ReportTools.hasHeader(this,this.result.stats)) return "";
		var end = haxe.Timer.stamp();
		var time = ((end - this.startTime) * 1000 | 0) / 1000;
		var msg = "TEST OK";
		if(this.result.stats.hasErrors) msg = "TEST ERRORS"; else if(this.result.stats.hasFailures) msg = "TEST FAILED"; else if(this.result.stats.hasWarnings) msg = "WARNING REPORTED";
		buf.b += Std.string("<h1 class=\"" + this.cls(this.result.stats) + "bg header\">" + msg + "</h1>\n");
		buf.b += "<div class=\"headerinfo\">";
		this.resultNumbers(buf,this.result.stats);
		buf.b += Std.string(" performed on <strong>" + utest.ui.text.HtmlReport.platform + "</strong>, executed in <strong> " + time + " sec. </strong></div >\n ");
		return buf.b;
	}
	,addPackage: function(buf,result,name,isOk) {
		if(utest.ui.common.ReportTools.skipResult(this,result.stats,isOk)) return;
		if(name == "" && result.classNames().length == 0) return;
		buf.b += "<li>";
		buf.b += Std.string("<h2>" + name + "</h2>");
		this.blockNumbers(buf,result.stats);
		buf.b += "<ul>\n";
		var _g = 0, _g1 = result.classNames();
		while(_g < _g1.length) {
			var cname = _g1[_g];
			++_g;
			this.addClass(buf,result.getClass(cname),cname,isOk);
		}
		buf.b += "</ul>\n";
		buf.b += "</li>\n";
	}
	,addPackages: function(buf,result,isOk) {
		if(utest.ui.common.ReportTools.skipResult(this,result.stats,isOk)) return;
		buf.b += "<ul id=\"utest-results-packages\">\n";
		var _g = 0, _g1 = result.packageNames(false);
		while(_g < _g1.length) {
			var name = _g1[_g];
			++_g;
			this.addPackage(buf,result.getPackage(name),name,isOk);
		}
		buf.b += "</ul>\n";
	}
	,addClass: function(buf,result,name,isOk) {
		if(utest.ui.common.ReportTools.skipResult(this,result.stats,isOk)) return;
		buf.b += "<li>";
		buf.b += Std.string("<h2 class=\"classname\">" + name + "</h2>");
		this.blockNumbers(buf,result.stats);
		buf.b += "<ul>\n";
		var _g = 0, _g1 = result.methodNames();
		while(_g < _g1.length) {
			var mname = _g1[_g];
			++_g;
			this.addFixture(buf,result.get(mname),mname,isOk);
		}
		buf.b += "</ul>\n";
		buf.b += "</li>\n";
	}
	,getErrorStack: function(s,e) {
		return this.formatStack(s);
	}
	,getErrorDescription: function(e) {
		return Std.string(e);
	}
	,addFixture: function(buf,result,name,isOk) {
		if(utest.ui.common.ReportTools.skipResult(this,result.stats,isOk)) return;
		buf.b += "<li class=\"fixture\"><div class=\"li\">";
		buf.b += Std.string("<span class=\"" + this.cls(result.stats) + "bg fixtureresult\">");
		if(result.stats.isOk) buf.b += "OK "; else if(result.stats.hasErrors) buf.b += "ERROR "; else if(result.stats.hasFailures) buf.b += "FAILURE "; else if(result.stats.hasWarnings) buf.b += "WARNING ";
		buf.b += "</span>";
		buf.b += "<div class=\"fixturedetails\">";
		buf.b += Std.string("<strong>" + name + "</strong>");
		buf.b += ": ";
		this.resultNumbers(buf,result.stats);
		var messages = [];
		var $it0 = result.iterator();
		while( $it0.hasNext() ) {
			var assertation = $it0.next();
			var $e = (assertation);
			switch( $e[1] ) {
			case 0:
				break;
			case 1:
				var assertation_eFailure_1 = $e[3], assertation_eFailure_0 = $e[2];
				messages.push("<strong>line " + assertation_eFailure_1.lineNumber + "</strong>: <em>" + StringTools.htmlEscape(assertation_eFailure_0) + "</em>");
				break;
			case 2:
				var assertation_eError_1 = $e[3], assertation_eError_0 = $e[2];
				messages.push("<strong>error</strong>: <em>" + this.getErrorDescription(assertation_eError_0) + "</em>\n<br/><strong>stack</strong>:" + this.getErrorStack(assertation_eError_1,assertation_eError_0));
				break;
			case 3:
				var assertation_eSetupError_1 = $e[3], assertation_eSetupError_0 = $e[2];
				messages.push("<strong>setup error</strong>: " + this.getErrorDescription(assertation_eSetupError_0) + "\n<br/><strong>stack</strong>:" + this.getErrorStack(assertation_eSetupError_1,assertation_eSetupError_0));
				break;
			case 4:
				var assertation_eTeardownError_1 = $e[3], assertation_eTeardownError_0 = $e[2];
				messages.push("<strong>tear-down error</strong>: " + this.getErrorDescription(assertation_eTeardownError_0) + "\n<br/><strong>stack</strong>:" + this.getErrorStack(assertation_eTeardownError_1,assertation_eTeardownError_0));
				break;
			case 5:
				var assertation_eTimeoutError_0 = $e[2];
				messages.push("<strong>missed async call(s)</strong>: " + assertation_eTimeoutError_0);
				break;
			case 6:
				var assertation_eAsyncError_1 = $e[3], assertation_eAsyncError_0 = $e[2];
				messages.push("<strong>async error</strong>: " + this.getErrorDescription(assertation_eAsyncError_0) + "\n<br/><strong>stack</strong>:" + this.getErrorStack(assertation_eAsyncError_1,assertation_eAsyncError_0));
				break;
			case 7:
				var assertation_eWarning_0 = $e[2];
				messages.push(StringTools.htmlEscape(assertation_eWarning_0));
				break;
			}
		}
		if(messages.length > 0) {
			buf.b += "<div class=\"testoutput\">";
			buf.b += Std.string(messages.join("<br/>"));
			buf.b += "</div>\n";
		}
		buf.b += "</div>\n";
		buf.b += "</div></li>\n";
	}
	,formatStack: function(stack,addNL) {
		if(addNL == null) addNL = true;
		var parts = [];
		var nl = addNL?"\n":"";
		var last = null;
		var count = 1;
		var _g = 0, _g1 = haxe.CallStack.toString(stack).split("\n");
		while(_g < _g1.length) {
			var part = _g1[_g];
			++_g;
			if(StringTools.trim(part) == "") continue;
			if(-1 < part.indexOf("Called from utest.")) continue;
			if(part == last) parts[parts.length - 1] = part + " (#" + ++count + ")"; else {
				count = 1;
				parts.push(last = part);
			}
		}
		var s = "<ul><li>" + parts.join("</li>" + nl + "<li>") + "</li></ul>" + nl;
		return "<div>" + s + "</div>" + nl;
	}
	,blockNumbers: function(buf,stats) {
		buf.b += Std.string("<div class=\"" + this.cls(stats) + "bg statnumbers\">");
		this.resultNumbers(buf,stats);
		buf.b += "</div>";
	}
	,resultNumbers: function(buf,stats) {
		var numbers = [];
		if(stats.assertations == 1) numbers.push("<strong>1</strong> test"); else numbers.push("<strong>" + stats.assertations + "</strong> tests");
		if(stats.successes != stats.assertations) {
			if(stats.successes == 1) numbers.push("<strong>1</strong> pass"); else if(stats.successes > 0) numbers.push("<strong>" + stats.successes + "</strong> passes");
		}
		if(stats.errors == 1) numbers.push("<strong>1</strong> error"); else if(stats.errors > 0) numbers.push("<strong>" + stats.errors + "</strong> errors");
		if(stats.failures == 1) numbers.push("<strong>1</strong> failure"); else if(stats.failures > 0) numbers.push("<strong>" + stats.failures + "</strong> failures");
		if(stats.warnings == 1) numbers.push("<strong>1</strong> warning"); else if(stats.warnings > 0) numbers.push("<strong>" + stats.warnings + "</strong> warnings");
		buf.b += Std.string(numbers.join(", "));
	}
	,cls: function(stats) {
		if(stats.hasErrors) return "error"; else if(stats.hasFailures) return "failure"; else if(stats.hasWarnings) return "warn"; else return "ok";
	}
	,start: function(e) {
		this.startTime = haxe.Timer.stamp();
	}
	,startTime: null
	,_trace: function(v,infos) {
		var time = haxe.Timer.stamp();
		var delta = this._traceTime == null?0:time - this._traceTime;
		this._traces.push({ msg : StringTools.htmlEscape(Std.string(v)), infos : infos, time : time - this.startTime, delta : delta, stack : haxe.CallStack.callStack()});
		this._traceTime = haxe.Timer.stamp();
	}
	,_traceTime: null
	,restoreTrace: function() {
		if(!this.traceRedirected) return;
		haxe.Log.trace = this.oldTrace;
	}
	,redirectTrace: function() {
		if(this.traceRedirected) return;
		this._traces = [];
		this.oldTrace = haxe.Log.trace;
		haxe.Log.trace = $bind(this,this._trace);
	}
	,setHandler: function(handler) {
		this.handler = handler;
	}
	,_traces: null
	,oldTrace: null
	,aggregator: null
	,handler: null
	,displayHeader: null
	,displaySuccessResults: null
	,traceRedirected: null
	,__class__: utest.ui.text.HtmlReport
}
utest.ui.text.PlainTextReport = function(runner,outputHandler) {
	this.aggregator = new utest.ui.common.ResultAggregator(runner,true);
	runner.onStart.add($bind(this,this.start));
	this.aggregator.onComplete.add($bind(this,this.complete));
	if(null != outputHandler) this.setHandler(outputHandler);
	this.displaySuccessResults = utest.ui.common.SuccessResultsDisplayMode.AlwaysShowSuccessResults;
	this.displayHeader = utest.ui.common.HeaderDisplayMode.AlwaysShowHeader;
};
utest.ui.text.PlainTextReport.__name__ = ["utest","ui","text","PlainTextReport"];
utest.ui.text.PlainTextReport.__interfaces__ = [utest.ui.common.IReport];
utest.ui.text.PlainTextReport.prototype = {
	complete: function(result) {
		this.result = result;
		this.handler(this);
	}
	,getResults: function() {
		var buf = new StringBuf();
		this.addHeader(buf,this.result);
		var _g = 0, _g1 = this.result.packageNames();
		while(_g < _g1.length) {
			var pname = _g1[_g];
			++_g;
			var pack = this.result.getPackage(pname);
			if(utest.ui.common.ReportTools.skipResult(this,pack.stats,this.result.stats.isOk)) continue;
			var _g2 = 0, _g3 = pack.classNames();
			while(_g2 < _g3.length) {
				var cname = _g3[_g2];
				++_g2;
				var cls = pack.getClass(cname);
				if(utest.ui.common.ReportTools.skipResult(this,cls.stats,this.result.stats.isOk)) continue;
				buf.b += Std.string((pname == ""?"":pname + ".") + cname + this.newline);
				var _g4 = 0, _g5 = cls.methodNames();
				while(_g4 < _g5.length) {
					var mname = _g5[_g4];
					++_g4;
					var fix = cls.get(mname);
					if(utest.ui.common.ReportTools.skipResult(this,fix.stats,this.result.stats.isOk)) continue;
					buf.b += Std.string(this.indents(1) + mname + ": ");
					if(fix.stats.isOk) buf.b += "OK "; else if(fix.stats.hasErrors) buf.b += "ERROR "; else if(fix.stats.hasFailures) buf.b += "FAILURE "; else if(fix.stats.hasWarnings) buf.b += "WARNING ";
					var messages = "";
					var $it0 = fix.iterator();
					while( $it0.hasNext() ) {
						var assertation = $it0.next();
						var $e = (assertation);
						switch( $e[1] ) {
						case 0:
							buf.b += ".";
							break;
						case 1:
							var assertation_eFailure_1 = $e[3], assertation_eFailure_0 = $e[2];
							buf.b += "F";
							messages += this.indents(2) + "line: " + assertation_eFailure_1.lineNumber + ", " + assertation_eFailure_0 + this.newline;
							break;
						case 2:
							var assertation_eError_1 = $e[3], assertation_eError_0 = $e[2];
							buf.b += "E";
							messages += this.indents(2) + Std.string(assertation_eError_0) + this.dumpStack(assertation_eError_1) + this.newline;
							break;
						case 3:
							var assertation_eSetupError_1 = $e[3], assertation_eSetupError_0 = $e[2];
							buf.b += "S";
							messages += this.indents(2) + Std.string(assertation_eSetupError_0) + this.dumpStack(assertation_eSetupError_1) + this.newline;
							break;
						case 4:
							var assertation_eTeardownError_1 = $e[3], assertation_eTeardownError_0 = $e[2];
							buf.b += "T";
							messages += this.indents(2) + Std.string(assertation_eTeardownError_0) + this.dumpStack(assertation_eTeardownError_1) + this.newline;
							break;
						case 5:
							var assertation_eTimeoutError_1 = $e[3], assertation_eTimeoutError_0 = $e[2];
							buf.b += "O";
							messages += this.indents(2) + "missed async calls: " + assertation_eTimeoutError_0 + this.dumpStack(assertation_eTimeoutError_1) + this.newline;
							break;
						case 6:
							var assertation_eAsyncError_1 = $e[3], assertation_eAsyncError_0 = $e[2];
							buf.b += "A";
							messages += this.indents(2) + Std.string(assertation_eAsyncError_0) + this.dumpStack(assertation_eAsyncError_1) + this.newline;
							break;
						case 7:
							var assertation_eWarning_0 = $e[2];
							buf.b += "W";
							messages += this.indents(2) + assertation_eWarning_0 + this.newline;
							break;
						}
					}
					buf.b += Std.string(this.newline);
					buf.b += Std.string(messages);
				}
			}
		}
		return buf.b;
	}
	,result: null
	,addHeader: function(buf,result) {
		if(!utest.ui.common.ReportTools.hasHeader(this,result.stats)) return;
		var end = haxe.Timer.stamp();
		var time = ((end - this.startTime) * 1000 | 0) / 1000;
		buf.b += Std.string("results: " + (result.stats.isOk?"ALL TESTS OK":"SOME TESTS FAILURES") + this.newline + " " + this.newline);
		buf.b += Std.string("assertations: " + result.stats.assertations + this.newline);
		buf.b += Std.string("successes: " + result.stats.successes + this.newline);
		buf.b += Std.string("errors: " + result.stats.errors + this.newline);
		buf.b += Std.string("failures: " + result.stats.failures + this.newline);
		buf.b += Std.string("warnings: " + result.stats.warnings + this.newline);
		buf.b += Std.string("execution time: " + time + this.newline);
		buf.b += Std.string(this.newline);
	}
	,dumpStack: function(stack) {
		if(stack.length == 0) return "";
		var parts = haxe.CallStack.toString(stack).split("\n"), r = [];
		var _g = 0;
		while(_g < parts.length) {
			var part = parts[_g];
			++_g;
			if(part.indexOf(" utest.") >= 0) continue;
			r.push(part);
		}
		return r.join(this.newline);
	}
	,indents: function(c) {
		var s = "";
		var _g = 0;
		while(_g < c) {
			var _ = _g++;
			s += this.indent;
		}
		return s;
	}
	,start: function(e) {
		this.startTime = haxe.Timer.stamp();
	}
	,startTime: null
	,setHandler: function(handler) {
		this.handler = handler;
	}
	,indent: null
	,newline: null
	,aggregator: null
	,handler: null
	,displayHeader: null
	,displaySuccessResults: null
	,__class__: utest.ui.text.PlainTextReport
}
utest.ui.text.PrintReport = function(runner) {
	utest.ui.text.PlainTextReport.call(this,runner,$bind(this,this._handler));
	this.newline = "\n";
	this.indent = "  ";
};
utest.ui.text.PrintReport.__name__ = ["utest","ui","text","PrintReport"];
utest.ui.text.PrintReport.__super__ = utest.ui.text.PlainTextReport;
utest.ui.text.PrintReport.prototype = $extend(utest.ui.text.PlainTextReport.prototype,{
	_trace: function(s) {
		s = StringTools.replace(s,"  ",this.indent);
		s = StringTools.replace(s,"\n",this.newline);
		haxe.Log.trace(s,{ fileName : "PrintReport.hx", lineNumber : 65, className : "utest.ui.text.PrintReport", methodName : "_trace"});
	}
	,_handler: function(report) {
		this._trace(report.getResults());
	}
	,useTrace: null
	,__class__: utest.ui.text.PrintReport
});
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; };
var $_;
function $bind(o,m) { var f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; return f; };
if(Array.prototype.indexOf) HxOverrides.remove = function(a,o) {
	var i = a.indexOf(o);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
}; else null;
Math.__name__ = ["Math"];
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i) {
	return isNaN(i);
};
String.prototype.__class__ = String;
String.__name__ = ["String"];
Array.prototype.__class__ = Array;
Array.__name__ = ["Array"];
Date.prototype.__class__ = Date;
Date.__name__ = ["Date"];
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
haxe.ds.ObjectMap.count = 0;
js.Browser.document = typeof window != "undefined" ? window.document : null;
precog.layout.TestCanvasLayout.point0 = new precog.geom.Point(0,0);
thx.react.Binder.KEY_SEPARATOR = " ";
thx.react.Dispatcher.TYPE_SEPARATOR = ";";
thx.react.Propagation.instance = new thx.react.Propagation();
thx.react.Responder.SEPARATOR = ":";
thx.react.ds.ProcedureList.iterator_id = 0;
utest.TestHandler.POLLING_TIME = 10;
utest.ui.text.HtmlReport.platform = "javascript";
TestAll.main();
})();
