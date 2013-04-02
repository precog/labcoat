package precog.app.module.view;

import precog.app.message.*;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.editor.*;
import precog.html.HtmlButton;
import precog.html.HtmlDropdown;
import jQuery.JQuery;
import jQuery.Event;

class EditorToolbarModule extends Module {
    public static var element = new JQuery('<div class="toolbar"></div>');
    public static var notebooksElement = new JQuery('<div class="notebooks pull-left"></div>').appendTo(element);
    static var closeNotebookClass = 'close-notebook';

    var communicator : Communicator;
    override public function connect(communicator: Communicator) {
        this.communicator = communicator;
        communicator.demand(MainToolbarHtmlPanelMessage).then(init);
        communicator.on(updateNotebooks);
    }

    override public function disconnect(communicator: Communicator) {
        element.remove();
    }

    function init(toolbarPanelMessage: MainToolbarHtmlPanelMessage) {
        toolbarPanelMessage.value.element.append(element);

        var items = [
            DropdownButton('New notebook', '', createNotebook),
            DropdownButton('Close notebook', closeNotebookClass, closeNotebook),
            DropdownDivider,
            DropdownButton('Insert region', '', createRegion)
        ];
        new HtmlDropdown('', 'cog', Mini, items, DropdownAlignRight).element.appendTo(element);
    }

    // TODO: change so that it uses the HtmlButton properties instead of accessing the underlying element
    function updateNotebooks(event: EditorNotebookUpdate) {
        notebooksElement.empty();
        for(notebook in event.all) {
            var buttonElement = new HtmlButton("My Notebook", Mini).element.appendTo(notebooksElement).click(changeNotebook(notebook));
            if(notebook == event.current) {
                buttonElement.addClass('active');
            }
        }

        // TODO: This could be made nicer.
        var closeNotebookItem = new JQuery('.${closeNotebookClass}');
        if(event.all.length <= 1) {
            closeNotebookItem.addClass('disabled');
        } else {
            closeNotebookItem.removeClass('disabled');
        }
    }

    // TODO: change so that it uses the HtmlButton properties instead of accessing the underlying element
    function changeNotebook(notebook: Notebook) {
        return function(event: Event) {
            notebooksElement.find('button.active').removeClass('active');
            communicator.trigger(new EditorNotebookSwitchTo(notebook));
        };
    }

    function createNotebook(event: Event) {
        event.preventDefault();
        communicator.trigger(new EditorNotebookRequestCreate());
    }

    function closeNotebook(event: Event) {
        event.preventDefault();
        communicator.trigger(new EditorNotebookRequestCloseCurrent());
    }

    function createRegion(event: Event) {
        event.preventDefault();
        communicator.trigger(new EditorRegionRequestCreate(new Region(QuirrelRegionMode)));
    }
}
