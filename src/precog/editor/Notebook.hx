package precog.editor;

import labcoat.message.PrecogRequest;
import labcoat.message.PrecogResponse;
import labcoat.message.RegionDrag;
import precog.communicator.Communicator;
import precog.editor.Editor;
import precog.util.Locale;
import jQuery.JQuery;
import thx.react.Signal;

using Lambda;

class Notebook implements Editor {
    public var events(default, null) : {
        public function clear() : Void;
    };
    public var element(default, null): JQuery;
    public var path(default, null): String;
    var communicator: Communicator;
    var locale: Locale;
    var metadataPath: String;
    var regions: Array<Region>;
    var regionCounter: Int;

    public function new(communicator: Communicator, path: String, locale: Locale) {
        element = new JQuery('<div class="notebook"></div>');
        regions = [];
        events = {
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
        this.locale = locale;
        this.path = path;

        communicator.on(function(e : RegionDragStart)
            element.addClass('dragging'));
        communicator.on(function(e : RegionDragStop)
            element.removeClass('dragging'));

        metadataPath = '${path}/metadata.json';
        regionCounter = 0;

        loadMetadata();
    }

    function loadMetadata() {
        communicator.request(
            new RequestFileGet(metadataPath),
            ResponseFileGet
        ).then(function(response: ResponseFileGet) {
            var metadata = haxe.Json.parse(response.content.contents)[0];
            if(metadata == null) {
                createRegion(QuirrelRegionMode);
                return;
            }

            regionCounter = metadata.regionCounter;

            var metadataRegions: Array<{filename: String, mode: Int}> = metadata.regions;
            if(metadata.regions.length == 0) return;

            // Clear any regions which were added before loading metadata
            clearInitialRegions();

            for(metadataRegion in metadataRegions) {
                var region = new Region(communicator, path, metadataRegion.filename, Type.createEnumIndex(RegionMode, metadataRegion.mode), locale);
                appendUnsavedRegion(region);
                regions.push(region);
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
            type: 'notebook',
            regions: regions.map(function(region: Region) {
                return {
                    filename: region.filename,
                    mode: Type.enumIndex(region.mode)
                };
            }),
            regionCounter: regionCounter
        });
    }

    public function save(dest: String) {
        communicator.request(
            new RequestNotebookMove(path, dest),
            ResponseNotebookMove
        ).then(function(response: ResponseNotebookMove) {
            path = dest;
            metadataPath = '${path}/metadata.json';
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

    public function removeRegion(region: Region) {
        regions.remove(region);
        region.events.clear();
        region.element.remove();
    }

    public function deleteRegion(region: Region) {
        removeRegion(region);
        saveMetadata();

        communicator.request(
            new RequestFileDelete(region.path()),
            ResponseFileDelete
        );
    }

    public function changeRegionMode(oldRegion: Region, mode: RegionMode) {
        oldRegion.events.clear();

        var content = oldRegion.editor.getContent();
        var region = new Region(communicator, oldRegion.directory, oldRegion.filename, mode, locale);
        region.editor.setContent(content);
        appendUnsavedRegion(region, oldRegion.element);
        regions[regions.indexOf(oldRegion)] = region;

        deleteRegion(oldRegion);
    }

    public function focusPreviousRegion(region: Region) {
        var index = Lambda.indexOf(regions, region) - 1;
        if(index < 0) return;
        regions[index].editor.focus();
    }

    public function focusNextRegion(region: Region) {
        var index = Lambda.indexOf(regions, region) + 1;
        if(index >= regions.length) return;
        regions[index].editor.focus();
    }

    function appendUnsavedRegion(region: Region, ?target: JQuery) {
        region.events.changeMode.on(changeRegionMode);
        region.events.delete.on(deleteRegion);
        if(target != null) {
            target.after(region.element);
        } else {
            element.append(region.element);
        }
        region.editor.focus();
    }

    public function moveToRegion(from: Region, to: Region) {
        removeRegion(from);

        var created = new Region(communicator, from.path(), from.filename, from.mode, locale);
        created.editor.setContent(from.editor.getContent());
        appendRegion(created, to.element);
    }

    public function createRegion(regionMode: RegionMode, ?target: JQuery) {
        appendRegion(new Region(communicator, path, 'out${incrementRegionCounter()}', regionMode, locale), target);
    }

    public function appendRegion(region: Region, ?target: JQuery) {
        appendUnsavedRegion(region, target);
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

    public function toString()
        return 'Notebook - $path (${regions.length} region[s])';
}
