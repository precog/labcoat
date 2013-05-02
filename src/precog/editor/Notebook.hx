package precog.editor;

import precog.app.message.PrecogRequest;
import precog.app.message.PrecogResponse;
import precog.communicator.Communicator;
import precog.editor.Editor;
import precog.util.Locale;
import jQuery.JQuery;
import thx.react.Signal;

class Notebook implements Editor {
    @:isVar public var name(get, set) : String;
    public var events(default, null) : {
        public var changeName(default, null) : Signal2<String, Notebook>;
        public function clear() : Void;
    };
    public var element(default, null): JQuery;
    public var path(default, null): String;
    var metadataPath: String;
    var communicator: Communicator;
    var regions: Array<Region>;
    var regionCounter: Int;

    public function new(communicator: Communicator, path: String, name: String, locale: Locale) {
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
        this.communicator = communicator;
        this.path = path;
        this.name = name;

        metadataPath = '${path}/metadata.json';
        regionCounter = 0;

        communicator.request(
            new RequestFileGet(metadataPath),
            ResponseFileGet
        ).then(function(response: ResponseFileGet) {
            var metadata = haxe.Json.parse(response.content.contents)[0];

            name = metadata.name;
            regionCounter = metadata.regionCounter;

            // Clear any regions which were added before loading metadata
            clearInitialRegions();

            var metadataRegions: Array<{path: String, mode: Int}> = metadata.regions;
            for(region in metadataRegions) {
                appendRegion(new Region(communicator, region.path, Type.createEnumIndex(RegionMode, region.mode), locale));
            }
        });
    }

    function saveMetadata() {
        communicator.request(
            new RequestFileUpload(metadataPath, 'application/json', serializeMetadata()),
            ResponseFileUpload
        );
    }

    function serializeMetadata() {
        return haxe.Json.stringify({
            name: name,
            regions: regions.map(function(region: Region) {
                return {
                    path: region.path,
                    mode: Type.enumIndex(region.mode)
                };
            }),
            regionCounter: regionCounter
        });
    }

    public function clear()
        for(region in regions)
            region.events.clear();

    public function clearInitialRegions() {
        for(region in regions) {
            regions.remove(region);
            region.element.remove();
        }
    }

    public function deleteRegion(region: Region) {
        regions.remove(region);
        region.element.remove();
        saveMetadata();
    }

    public function appendRegion(region: Region, ?target: JQuery) {
        if(target != null) {
            target.after(region.element);
        } else {
            element.append(region.element);
        }
        region.editor.focus();
        regions.push(region);
        saveMetadata();
    }

    public function show() {
        for(region in regions) {
            region.editor.focus();
        }
    }

    public function incrementRegionCounter() {
        return ++regionCounter;
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
