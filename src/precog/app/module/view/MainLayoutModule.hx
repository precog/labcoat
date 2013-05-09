package precog.app.module.view;

import precog.app.message.MainHtmlPanel;
import precog.app.message.MainEditorHtmlPanel;
import precog.app.message.MainToolbarHtmlPanel;
import precog.app.message.MainStatusbarHtmlPanel;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanel;
import precog.geom.IRectangle;
import precog.layout.DockLayout;
import js.Browser;
import jQuery.JQuery;
using thx.react.IObservable;

using precog.html.JQuerys;
import precog.ViewConfig;

class MainLayoutModule extends Module {
    var communicator: Communicator;

    var container: JQuery;

    var layout: DockLayout;
    var panelMargin: Int = 3;

    var toolbar: HtmlPanel;
    var editor: HtmlPanel;
    var statusbar: HtmlPanel;

    override public function connect(communicator: Communicator) {
        this.communicator = communicator;
        communicator.demand(MainHtmlPanel).then(onMessage);
    }

    function onMessage(message: MainHtmlPanel) {
        container = message.panel.element;

        toolbar   = new HtmlPanel("toolbar", container);
        editor    = new HtmlPanel("editor", container);
        statusbar = new HtmlPanel("statusbar", container);

        layout = new DockLayout(0, 0);
        layout.defaultMargin = panelMargin;

        layout.addPanel(toolbar).dockTop(ViewConfig.toolbarHeight);
        layout.addPanel(editor).fill();
        layout.addPanel(statusbar).dockBottom(ViewConfig.statusbarHeight);

        message.panel.rectangle.addListener(updateLayout);
        updateLayout(message.panel.rectangle);

        communicator.provide(new MainToolbarHtmlPanel(toolbar));
        communicator.provide(new MainEditorHtmlPanel(editor));
        communicator.provide(new MainStatusbarHtmlPanel(statusbar));
    }

    function updateLayout(size : IRectangle) {
        layout.rectangle.updateSize(size);
        layout.update();
    }
}
