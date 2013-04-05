package precog.app.message;

import precog.macro.ValueClass;
import jQuery.Event;

class MenuItemMessage extends Message<MenuItem> { }

class MenuItem implements ValueClass {
    var group: TopLevelGroup;
    var label: String;
    var callback: Event -> Void;
    var index: Int;
}

enum TopLevelGroup {
    MenuFile(subgroup: SubgroupFile);
    MenuEdit(subgroup: SubgroupEdit);
    MenuView;
    MenuCode;
    MenuCollaborate;
    MenuHelp;
}

enum SubgroupFile {
    SubgroupFileLocal;
    SubgroupFileImportExport;
    SubgroupFileSave;
}

enum SubgroupEdit {
    SubgroupEditHistory;
}

class TopLevelGroups {
    public static function name(group: TopLevelGroup) {
        return switch(group) {
        case MenuFile(_): 'File';
        case MenuEdit(_): 'Edit';
        case MenuView: 'View';
        case MenuCode: 'Code';
        case MenuCollaborate: 'Collaboration';
        case MenuHelp: 'Edit';
        }
    }

    // This is awful. Haxe's fault.
    public static function subgroupIndex(group: TopLevelGroup) {
        var value: EnumValue = switch(group) {
        case MenuFile(subgroup): subgroup;
        case MenuEdit(subgroup): subgroup;
        default: null;
        }
        return Type.enumIndex(value);
    }
}
