package precog.app;

import precog.communicator.ModuleManager;
import js.JQuery;
import precog.app.module.view.*;
import precog.app.module.api.*;
import precog.editor.EditorModule;
import js.Browser.window;

class Main 
{
    static function main()
    {
        var manager = new ModuleManager();

        // View
        manager.addModule(new ContainerModule());
        manager.addModule(new LayoutModule());

        // Editor
        manager.addModule(new EditorModule());

        // API
        manager.addModule(new JavaScriptAPIModule());
        manager.addModule(new VersionModule());
    }
}
