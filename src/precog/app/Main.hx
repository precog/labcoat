package precog.app;

import precog.communicator.ModuleManager;
import precog.app.module.config.*;
import precog.app.module.view.*;
import precog.app.module.api.*;
import precog.editor.EditorModule;
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
        manager.addModule(new ContainerModule());
        manager.addModule(new LayoutModule());
        manager.addModule(new MainLayoutModule());

        manager.addModule(new SystemLayoutModule());
        manager.addModule(new FileSystemModule());

        manager.addModule(new SupportLayoutModule());
        manager.addModule(new TutorialModule());
        manager.addModule(new ReferenceModule());
        manager.addModule(new ExamplesModule());
        manager.addModule(new NotesModule());

        manager.addModule(new ToolsLayoutModule());
        manager.addModule(new TasksModule());
        manager.addModule(new SharingModule());
        manager.addModule(new ChatModule());

        // Editor
        manager.addModule(new EditorModule());

        // API
        manager.addModule(new JavaScriptAPIModule());
        manager.addModule(new VersionModule());
    }
}
