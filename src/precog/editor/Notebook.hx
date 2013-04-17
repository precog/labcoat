package precog.editor;

import precog.editor.Editor;
import jQuery.JQuery;
import thx.react.Signal;

class Notebook implements Editor {
    @:isVar public var name(get, set) : String;
    public var events(default, null) : {
        public var changeName(default, null) : Signal2<String, Notebook>;
        public function clear() : Void;
    };
    public var element(default, null): JQuery;
    var regions: Array<Region>;

    public function new(name : String) {
        element = new JQuery('<div class="notebook"></div>');
        regions = [];
        events = {
            changeName : new Signal2(),
            clear : function() {
                for(field in Reflect.fields(this))
                {
                    var signal : Signal<Dynamic> = Reflect.field(this, field);
                    if(!Std.is(signal, Signal)) continue;
                    signal.clear();
                }
            }
        };
        this.name = name;
    }

    public function clear()
        for(region in regions)
            region.events.clear();

    public function deleteRegion(region: Region) {
        regions.remove(region);
        region.element.remove();
    }

    public function appendRegion(region: Region, ?target: JQuery) {
        if(target != null) {
            target.after(region.element);
        } else {
            element.append(region.element);
        }
        region.editor.focus();
        regions.push(region);
    }

    public function show() {
        for(region in regions) {
            region.editor.focus();
        }
    }

    function get_name()
        return name;

    function set_name(value : String)
    {
        if(value == name) return value;
        var old = name;
        name = value;
        events.changeName.trigger(old, this);
        return value;
    }

    public function toString()
        return 'Notebook - $name (${regions.length} region[s])';
}
