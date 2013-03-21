package precog.app;

import precog.communicator.ModuleManager;
import js.JQuery;
import precog.app.module.view.*;
import precog.app.module.api.*;
import js.Browser.window;

class Main 
{
    static function main()
    {
        var manager = new ModuleManager();
        // view
        manager.addModule(new ContainerModule());
        manager.addModule(new LayoutModule());

        // API
        manager.addModule(new JavaScriptAPIModule());
        manager.addModule(new VersionModule());
    }
}
