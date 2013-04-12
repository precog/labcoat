package precog.app.message;

import precog.macro.ValueClass;
import jQuery.Event;

class MenuItemMessage extends Message<MenuItem> { }

class MenuItem implements ValueClass {
    var group: TopLevelGroup;
    var label: String;
    var callback: Event -> Void;
    var weight: Int;
}

enum TopLevelGroup {
    MenuFile(subgroup: SubgroupFile);
    MenuEdit(subgroup: SubgroupEdit);
    MenuFind(subgroup: SubgroupFind);
    MenuView(subgroup: SubgroupView);
    MenuCode(subgroup: SubgroupCode);
    MenuCollaborate(subgroup: SubgroupCollaborate);
    MenuHelp(subgroup: SubgroupHelp);
}

enum SubgroupFile {
    SubgroupFileLocal;
    SubgroupFileImportExport;
    SubgroupFileSave;
}

enum SubgroupEdit {
    SubgroupEditHistory;
}

enum SubgroupFind {
}

enum SubgroupView {
}

enum SubgroupCode {
    SubgroupCodeVariables;
    SubgroupCodeComments;
    SubgroupCodeDeclarations;
    SubgroupCodeFormating;
    SubgroupCodeInsert;
    SubgroupCodeRun;
}

enum SubgroupCollaborate {
    SubgroupCollaborateChannels;
    SubgroupCollaborateSharing;
    SubgroupCollaborateComments;
}

enum SubgroupHelp {
    SubgroupHelpLookup;
    SubgroupHelpQuirrel;
    SubgroupHelpSupport;
}


class TopLevelGroups {
    public static function name(group: TopLevelGroup) {
        return switch(group) {
        case MenuFile(_): 'File';
        case MenuEdit(_): 'Edit';
        case MenuFind(_): 'Find';
        case MenuView(_): 'View';
        case MenuCode(_): 'Code';
        case MenuCollaborate(_): 'Collaborate';
        case MenuHelp(_): 'Help';
        }
    }

    // This is awful. Haxe's fault.
    public static function subgroupIndex(group: TopLevelGroup) {
        var value: EnumValue = switch(group) {
        case MenuFile(subgroup): subgroup;
        case MenuEdit(subgroup): subgroup;
        case MenuFind(subgroup): subgroup;
        case MenuView(subgroup): subgroup;
        case MenuCode(subgroup): subgroup;
        case MenuCollaborate(subgroup): subgroup;
        case MenuHelp(subgroup): subgroup;
        }
        return Type.enumIndex(value);
    }

    public static function isHidden(group: TopLevelGroup, platform: String) {
        if(platform == "darwin") {
            return switch(group) {
            case MenuEdit(_): true;
            case _: false;
            }
        }
        return false;
    }
}
