package labcoat.module.view.nodewebkit;

@:native("process") extern class Process {
    static var platform: String;
}

typedef MenuItemConfig = {
    ?type: String,
    ?label: String,
    ?click: Void -> Void,
    ?submenu: Menu
};

extern class MenuItem {
    var label: String;
    var type: String;
}

class MenuItemFactory {
    public static function createEmpty(): MenuItem untyped {
        var gui = require('nw.gui');
        return untyped __js__("new gui.MenuItem()");
    }
    public static function create(options: MenuItemConfig): MenuItem untyped {
        var gui = require('nw.gui');
        return untyped __js__("new gui.MenuItem(options)");
    }
}

extern class Menu {
    var items: Array<MenuItem>;

    function append(item: MenuItem): Void;
    function remove(item: MenuItem): Void;
    function insert(item: MenuItem, index: Int): Void;
    function removeAt(index: Int): Void;
    function popup(x: Int, y: Int): Void;
}

typedef MenuConfig = {
    ?type: String
};

class MenuFactory {
    public static function createEmpty(): Menu untyped {
        var gui = require('nw.gui');
        return untyped __js__("new gui.Menu()");
    }
    public static function create(options: MenuConfig): Menu untyped {
        var gui = require('nw.gui');
        return untyped __js__("new gui.Menu(options)");
    }
}

extern class Window {
    var menu: Menu;
}

class GUI {
    public static function getWindow(): Window untyped {
        var gui = require('nw.gui');
        return gui.Window.get();
    }
}
