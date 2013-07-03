package labcoat;

import precog.communicator.ModuleManager;

import precog.module.api.*;
import precog.module.config.*;
import precog.module.model.*;

import labcoat.module.api.*;
import labcoat.module.config.*;
import labcoat.module.model.*;
import labcoat.module.view.*;

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
        manager.addModule(new LogModule());
        manager.addModule(new JavascriptErrorInterceptModule());

        // View
        manager.addModule(new LoginModule());
/*
#if (html5 || cordova)
        manager.addModule(new Html5MenuModule());
#else
        manager.addModule(new NodeWebkitMenuModule());
#end
*/
        manager.addModule(new CollaborateMenuModule());
        manager.addModule(new HelpMenuModule());
        manager.addModule(new StatusModule());

        manager.addModule(new ContainerModule());
        manager.addModule(new LayoutModule());
        manager.addModule(new MainLayoutModule());

        manager.addModule(new TreeViewModule());

        manager.addModule(new labcoat.module.view.fstreeview.ActionsModule());
/* NOT IMPLEMENTED PANELS
        manager.addModule(new TutorialModule());
        manager.addModule(new ReferenceModule());
        manager.addModule(new ExamplesModule());
        manager.addModule(new NotesModule());

        manager.addModule(new TasksModule());
        manager.addModule(new SharingModule());
        manager.addModule(new ChatModule());
*/
        manager.addModule(new EditorModule());
        manager.addModule(new StatusbarModule());

        // Model
        manager.addModule(new PrecogAuthModule());
        manager.addModule(new PrecogModule());
        manager.addModule(new FileSystemModule());

        // API
        manager.addModule(new JavaScriptAPIModule());
        manager.addModule(new VersionModule());
    }
}
