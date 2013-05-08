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

    var communicator : Communicator;
    var locale : Locale;
    override public function connect(communicator: Communicator) {
        this.communicator = communicator;
        communicator
            .demand(MainToolbarHtmlPanel)
            .await(communicator.demand(Locale))
            .then(init);
    }

    function init(toolbarPanel: MainToolbarHtmlPanel, locale : Locale) {
        this.locale = locale;
        toolbarPanel.panel.element.append(element);

        var items = [
            DropdownButton(locale.singular('new notebook'), '', createNotebook),
            DropdownButton(locale.singular('new file'), '', createCodeEditor),
            DropdownDivider,
            DropdownButton(locale.singular('insert region'), '', createRegion),
            DropdownButton(locale.singular('save'), '', saveEditor),
        ];
        new HtmlDropdown('', 'cog', '', Mini, items, DropdownAlignRight).element.appendTo(element);
    }

    function createCodeEditor(event: Event) {
        event.preventDefault();
        communicator.trigger(new EditorCodeRequestCreate());
    }

    function createNotebook(event: Event) {
        event.preventDefault();
        communicator.trigger(new EditorNotebookRequestCreate());
    }

    function createRegion(event: Event) {
        event.preventDefault();
        communicator.trigger(new EditorRegionRequestCreate(QuirrelRegionMode));
    }

    function saveEditor(event: Event) {
        event.preventDefault();
        communicator.trigger(new EditorSave());
    }
}
