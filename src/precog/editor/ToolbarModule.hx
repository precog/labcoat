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
    public static var notebooksElement = new JQuery('<div class="notebooks pull-left"></div>').appendTo(element);

    override public function connect(communicator: Communicator) {
        communicator.demand(MainToolbarHtmlPanelMessage).then(init);
    }

    override public function disconnect(communicator: Communicator) {
        element.remove();
    }

    public function init(toolbarPanelMessage: MainToolbarHtmlPanelMessage) {
        toolbarPanelMessage.value.element.append(element);

        var items = [
            DropdownButton('New notebook', insertNotebook),
            DropdownButton('Close notebook', deleteNotebook),
            DropdownDivider,
            DropdownButton('Insert region', insertRegion)
        ];
        new HtmlDropdown('', 'cog', Mini, items, DropdownAlignRight).element.appendTo(element);
    }

    public static function updateNotebooks(notebooks: Array<Notebook>) {
        notebooksElement.html('');
        for(notebook in notebooks) {
            new HtmlButton("My Notebook", Mini).element.appendTo(notebooksElement).click(changeNotebook(notebook));
        }
    }

    static function changeNotebook(notebook: Notebook) {
        return function(event: Event) {
            EditorModule.changeNotebook(notebook);
        };
    }

    function insertNotebook(event: Event) {
        event.preventDefault();
        EditorModule.insertNotebook();
    }

    function deleteNotebook(event: Event) {
        event.preventDefault();
    }

    static function insertRegion(event: Event) {
        event.preventDefault();
        EditorModule.appendRegion(new Region(QuirrelRegionMode));
    }
}
