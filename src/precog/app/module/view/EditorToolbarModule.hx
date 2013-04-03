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

    function updateNotebooks(event: EditorNotebookUpdate) {
        // TODO: This could be made nicer.
        var closeNotebookItem = new JQuery('.${closeNotebookClass}');
        if(event.all.length <= 1) {
            closeNotebookItem.addClass('disabled');
        } else {
            closeNotebookItem.removeClass('disabled');
        }
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
