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
    static var closeEditorClass = 'close-editor';

    var communicator : Communicator;
    var locale : Locale;
    override public function connect(communicator: Communicator) {
        this.communicator = communicator;
        communicator
            .demand(MainToolbarHtmlPanel)
            .await(communicator.demand(Locale))
            .then(init);
        communicator.on(updateNotebooks);
    }

    function init(toolbarPanel: MainToolbarHtmlPanel, locale : Locale) {
        this.locale = locale;
        toolbarPanel.panel.element.append(element);

        var items = [
            DropdownButton(locale.singular('new notebook'), '', createNotebook),
            DropdownButton(locale.singular('new file'), '', createCodeEditor),
            DropdownButton(locale.singular('close editor'), closeEditorClass, closeEditor),
            DropdownDivider,
            DropdownButton(locale.singular('insert region'), '', createRegion)
        ];
        new HtmlDropdown('', 'cog', '', Mini, items, DropdownAlignRight).element.appendTo(element);
    }

    function updateNotebooks(event: EditorUpdate) {
        // TODO: This could be made nicer.
        var closeEditorItem = new JQuery('.${closeEditorClass}');
        if(event.all.length <= 1) {
            closeEditorItem.addClass('disabled');
        } else {
            closeEditorItem.removeClass('disabled');
        }
    }

    function createCodeEditor(event: Event) {
        event.preventDefault();
        communicator.trigger(new EditorCodeRequestCreate());
    }

    function createNotebook(event: Event) {
        event.preventDefault();
        communicator.trigger(new EditorNotebookRequestCreate());
    }

    function closeEditor(event: Event) {
        event.preventDefault();
        communicator.trigger(new EditorRequestCloseCurrent());
    }

    function createRegion(event: Event) {
        event.preventDefault();
        communicator.trigger(new EditorRegionRequestCreate(QuirrelRegionMode));
    }
}
