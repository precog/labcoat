package labcoat.message;

import precog.macro.ValueClass;
import precog.editor.Region;
import precog.editor.RegionMode;

class RegionDragStart implements ValueClass {
}

class RegionDragStop implements ValueClass {
}

class RegionDragTo implements ValueClass {
    var region: Region;
    var filename: String;
    var mode: RegionMode;
    var content: String;
}
