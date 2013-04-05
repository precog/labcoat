package precog.app.module.view;

import precog.app.message.MenuHtmlPanelMessage;
import precog.app.message.MenuItemMessage;
import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.html.HtmlButton;
import precog.html.HtmlDropdown;
import precog.html.HtmlPanel;
import precog.macro.ValueClass;
import precog.util.Locale;
import jQuery.JQuery;

using thx.react.Promise;

class Html5MenuGroup implements ValueClass {
    var dropdown: HtmlDropdown;
    var subgroups: Array<Array<DropdownItem>>;

    public function replaceDropdown(newDropdown: HtmlDropdown) {
        dropdown.element.replaceWith(newDropdown.element);
        dropdown = newDropdown;
    }
}

class Html5MenuModule extends Module {
    var element: JQuery;
    var groups: Array<Html5MenuGroup>;

    public function new() {
        super();
        groups = [];
    }

    override public function connect(communicator: Communicator) {
        communicator
            .demand(MenuHtmlPanelMessage)
            .await(communicator.demand(Locale))
            .then(onMessage.bind(communicator));
    }

    function onMessage(communicator: Communicator, message: MenuHtmlPanelMessage, locale: Locale) {
        var panel = message.value;
        //var element = new JQuery('<div class="btn-group"></div>').appendTo(panel.element);

        for(index in 0...Type.getEnumConstructs(TopLevelGroup).length) {
            var group = new Html5MenuGroup(createDropdown('', []), []);
            group.dropdown.element.appendTo(panel.element);
            groups[index] = group;
        }
        communicator.consume(onMenuItemMessages);
    }

    function onMenuItemMessages(messages: Array<MenuItemMessage>) {
        for(message in messages) {
            addItem(message.value);
        }
    }

    function addItem(item: MenuItem) {
        var index = Type.enumIndex(item.group);
        var group = groups[index];
        var subIndex = TopLevelGroups.subgroupIndex(item.group);
        var subgroup = group.subgroups[subIndex];

        if(subgroup == null) {
            group.subgroups[subIndex] = [];
        }

        var dropdownItems = group.subgroups[subIndex];
        dropdownItems[item.index] = DropdownButton(item.label, '', item.callback);
        group.replaceDropdown(createDropdown(TopLevelGroups.name(item.group), dropdownItems));
    }

    function createDropdown(name: String, items: Array<DropdownItem>) {
        return new HtmlDropdown(name, '', 'btn-group', Mini, items, DropdownAlignLeft);
    }
}
