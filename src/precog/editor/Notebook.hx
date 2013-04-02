package precog.editor;

import jQuery.JQuery;

class Notebook {
    public var element(default, null): JQuery;
    var regions: Array<Region>;

    public function new() {
        element = new JQuery('<div class="notebook"></div>');
        regions = [];
    }

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
}
