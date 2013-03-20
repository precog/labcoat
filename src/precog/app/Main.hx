package precog.app;

import precog.communicator.ModuleManager;
import js.JQuery;
import precog.app.module.view.*;
import js.Browser.window;

class Main 
{
    static function main()
    {
        // Add the Labcoat git version to the window.
        Reflect.setField(window, "labcoat2", {});
        Reflect.setField(untyped window.labcoat2, "version", VersionMacro.gitVersion());

        var manager = new ModuleManager();
        manager.addModule(new ContainerModule());
        manager.addModule(new LayoutModule());
    }
}
