package precog.html;

import jQuery.JQuery;
import jQuery.Event;
import precog.html.HtmlButton;
import precog.html.Bootstrap;

class HtmlDropdown {
    public var element(default, null) : JQuery;

    public function new(text: String, icon: String, classes: String, size: ButtonSize, items: Array<DropdownItem>, align: DropdownAlignment) {
        var pull = switch(align) {
        case DropdownAlignRight: "pull-right";
        case DropdownAlignLeft: "";
        }

        element = new JQuery('<div class="buttons dropdown ${classes} ${pull}"></div>');

        var button = new JQuery('<button class="btn ${ButtonSizes.toClass(size)} dropdown-toggle" data-toggle="dropdown">${text}</button>').appendTo(element);
        if(icon.length > 0) button.addClass("icon-" + icon);

        DropdownItems.groupToHtml(items).addClass(pull).appendTo(element);
    }
}

enum DropdownItem {
    DropdownButton(text: String, classes: String, action: Event -> Void);
    DropdownDivider;
}

class DropdownItems {
    public static function groupToHtml(group: Array<DropdownItem>) {
        var menu = new JQuery('<ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu"></ul>');
        for(item in group) {
            var itemElement = DropdownItems.itemToHtml(item);
            itemElement.appendTo(menu);
        }
        return menu;
    }

    static function itemToHtml(item: DropdownItem) {
        return switch(item) {
        case DropdownDivider: new JQuery('<li class="divider"></li>');
        case DropdownButton(text, classes, action): new JQuery('<li class="${classes}"><a tabindex="-1" href="#">${text}</a></li>').click(action);
        }
    }
}

enum DropdownAlignment {
    DropdownAlignRight;
    DropdownAlignLeft;
}
