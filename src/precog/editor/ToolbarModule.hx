package precog.editor;

import precog.app.message.MainToolbarHtmlPanelMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlButton;
import precog.html.HtmlDropdown;
import jQuery.JQuery;
import jQuery.Event;

class ToolbarModule extends Module {
    public static var element = new JQuery('<div class="toolbar"></div>');

    override public function connect(communicator: Communicator) {
        communicator.demand(MainToolbarHtmlPanelMessage).then(init);
    }

    override public function disconnect(communicator: Communicator) {
        element.remove();
    }

    public function init(toolbarPanelMessage: MainToolbarHtmlPanelMessage) {
        toolbarPanelMessage.value.element.append(element);

        element.append(new HtmlButton("Notebook #1", Mini).element);
        element.append(new HtmlButton("Notebook #2", Mini).element);
        element.append(new HtmlButton("Notebook #3", Mini).element);
        element.append(new HtmlButton("Notebook #4", Mini).element);

        var items = [
            DropdownButton('Insert region', insertRegion)
        ];
        new HtmlDropdown('', 'cog', Mini, items, DropdownAlignRight).element.appendTo(element);
    }

    static function insertRegion(event: Event) {
        event.preventDefault();
        EditorModule.appendRegion(new Region(QuirrelRegionMode));
    }
}
