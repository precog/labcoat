package labcoat.module.view;

import labcoat.config.ViewConfig;
import precog.html.HtmlPanel;
import precog.html.HtmlPanelGroup;
import precog.layout.DockLayout;

using thx.react.IObservable;

class ToolbarContainers {
    public var toolbar(default, null): HtmlPanel;
    public var main(default, null): HtmlPanel;

    public function new(group : HtmlPanelGroupItem) {
        toolbar = new HtmlPanel();
        main = new HtmlPanel();

        var layout = new DockLayout(group.panel.rectangle.width, group.panel.rectangle.height);
        layout.defaultMargin = ViewConfig.panelMargin;
        group.panel.rectangle.addListener(function(r) {
            layout.rectangle.updateSize(r); //updateSize
            layout.update();
        });

        group.panel.element.append(toolbar.element);
        group.panel.element.append(main.element);

        layout.addPanel(toolbar).dockTop(ViewConfig.toolbarHeight);
        layout.addPanel(main);
        layout.update();
    }
}
