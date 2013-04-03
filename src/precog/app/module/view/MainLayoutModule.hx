package precog.app.module.view;

import precog.app.message.MainHtmlPanelMessage;
import precog.app.message.MainEditorHtmlPanelMessage;
import precog.app.message.MainToolbarHtmlPanelMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanel;
import precog.geom.IRectangle;
import precog.layout.DockLayout;
import js.Browser;
import jQuery.JQuery;
using thx.react.IObservable;

using precog.html.JQuerys;

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
        communicator.demand(MainHtmlPanelMessage).then(onMessage);
    }

    function onMessage(message: MainHtmlPanelMessage) {
        container = message.value.element;

        toolbar   = new HtmlPanel("toolbar", container);
        editor    = new HtmlPanel("editor", container);
        statusbar = new HtmlPanel("statusbar", container);

        layout = new DockLayout(0, 0);
        layout.defaultMargin = panelMargin;

        layout.addPanel(toolbar.panel).dockTop(22);
        layout.addPanel(editor.panel).fill();
        layout.addPanel(statusbar.panel).dockBottom(20);

        message.value.panel.rectangle.addListener(updateLayout);
        updateLayout(message.value.panel.rectangle);

        communicator.provide(new MainToolbarHtmlPanelMessage(toolbar));
        communicator.provide(new MainEditorHtmlPanelMessage(editor));
    }

    function updateLayout(size : IRectangle) {
        layout.rectangle.updateSize(size);
        layout.update();
    }
}
