package precog.app;

import precog.communicator.ModuleManager;
import precog.app.module.config.*;
import precog.app.module.model.*;
import precog.app.module.view.*;
import precog.app.module.api.*;
import precog.editor.*;
import js.Browser.window;

class Main 
{
    static function main()
    {
        var manager = new ModuleManager();

        // Config
        manager.addModule(new LocalizationAdvisorModule());
        manager.addModule(new LocalizationModule());

        // View
#if (html5 || cordova)
        manager.addModule(new Html5MenuModule());
#else
        manager.addModule(new NodeWebkitMenuModule());
#end

        manager.addModule(new CollaborateMenuModule());
        manager.addModule(new HelpMenuModule());

        manager.addModule(new ContainerModule());
        manager.addModule(new LayoutModule());
        manager.addModule(new MainLayoutModule());

        manager.addModule(new TreeViewModule());
///* NOT IMPLEMENTED PANELS
        manager.addModule(new TutorialModule());
        manager.addModule(new ReferenceModule());
        manager.addModule(new ExamplesModule());
        manager.addModule(new NotesModule());

        manager.addModule(new TasksModule());
        manager.addModule(new SharingModule());
        manager.addModule(new ChatModule());
//*/
        manager.addModule(new EditorModule());
        manager.addModule(new EditorToolbarModule());

        // Model
        manager.addModule(new PrecogModule());
        manager.addModule(new FileSystemModule());

        // API
        manager.addModule(new JavaScriptAPIModule());
        manager.addModule(new VersionModule());
    }
}