package precog.app.module.view;

import precog.app.message.*;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.editor.*;
import precog.html.HtmlButton;
import precog.html.HtmlDropdown;
import precog.util.Locale;
using thx.react.Promise;
import jQuery.JQuery;
import jQuery.Event;

class EditorToolbarModule extends Module {
    public static var element = new JQuery('<div class="toolbar"></div>');
    public static var notebooksElement = new JQuery('<div class="notebooks pull-left"></div>').appendTo(element);
    static var closeNotebookClass = 'close-notebook';

    var communicator : Communicator;
    var locale : Locale;
    override public function connect(communicator: Communicator) {
        this.communicator = communicator;
        communicator
            .demand(MainToolbarHtmlPanelMessage)
            .await(communicator.demand(Locale))
            .then(init);
        communicator.on(updateNotebooks);
    }

    override public function disconnect(communicator: Communicator) {
        element.remove();
    }

    function init(toolbarPanelMessage: MainToolbarHtmlPanelMessage, locale : Locale) {
        this.locale = locale;
        toolbarPanelMessage.value.element.append(element);

        var items = [
            DropdownButton(locale.singular('new notebook'), '', createNotebook),
            DropdownButton(locale.singular('close notebook'), closeNotebookClass, closeNotebook),
            DropdownDivider,
            DropdownButton(locale.singular('insert region'), '', createRegion)
        ];
        new HtmlDropdown('', 'cog', Mini, items, DropdownAlignRight).element.appendTo(element);
    }

    // TODO: this needs to be removed and replaced with a proper name strategy
    static var counter : Int = 0;
    // TODO: change so that it uses the HtmlButton properties instead of accessing the underlying element
    // TODO: notebooks need to be paired with a name/path
    function updateNotebooks(event: EditorNotebookUpdate) {
        notebooksElement.empty();
        for(notebook in event.all) {
            var buttonElement = new HtmlButton(locale.format("notebook #{0}", [++counter]), Mini).element.appendTo(notebooksElement).click(changeNotebook(notebook));
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
        communicator.trigger(new EditorRegionRequestCreate(new Region(QuirrelRegionMode, locale)));
    }
}
