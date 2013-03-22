package precog.app.module.view;

import precog.app.message.HtmlMainPanelMessage;
import precog.app.message.HtmlMainEditorPanelMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlPanel;
import precog.layout.DockLayout;
import js.Browser;
import js.JQuery;

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
        communicator.demand(HtmlMainPanelMessage).then(onMainPanelMessage);
    }

    function onMainPanelMessage(message: HtmlMainPanelMessage) {
        container = message.value.element;

        toolbar = new HtmlPanel("toolbar", container);
        editor = new HtmlPanel("editor", container);
        statusbar = new HtmlPanel("statusbar", container);

        layout = new DockLayout(0, 0);
        layout.defaultMargin = panelMargin;

        updateLayout();
        new JQuery(Browser.window).resize(function(_) { updateLayout(); });

        communicator.provide(new HtmlMainEditorPanelMessage(editor));
    }

    function updateLayout() {
        var size = container.getInnerSize();

        layout.clear();

        layout.rectangle.set(0, 0, size.width, size.height);

        layout.addPanel(toolbar.panel).dockTop(20);
        layout.addPanel(editor.panel).fill();
        layout.addPanel(statusbar.panel).dockBottom(20);

        layout.update();
    }
}