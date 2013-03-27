package precog.html;

import jQuery.JQuery;
import jQuery.Event;
import precog.html.HtmlButton;
import precog.html.Bootstrap;

class HtmlDropdown {
    public var element(default, null) : JQuery;

    public function new(text: String, icon: String, size: ButtonSize, items: Array<DropdownItem>, align: DropdownAlignment) {
        var pull = switch(align) {
        case DropdownAlignRight: "pull-right";
        case DropdownAlignLeft: "";
        }

        element = new JQuery('<div class="buttons dropdown ${pull}"></div>');

        var button = new JQuery('<button class="btn ${ButtonSizes.toClass(size)}" class="dropdown-toggle" data-toggle="dropdown">${text}</button>').appendTo(element);
        if(icon.length > 0) button.addClass("icon-" + icon);

        var menu = new JQuery('<ul class="dropdown-menu ${pull}" role="menu" aria-labelledby="dropdownMenu"></ul>').appendTo(element);

        for(item in items) {
            var itemElement = switch(item) {
            case DropdownDivider: new JQuery('<li class="divider"></li>');
            case DropdownButton(text, action): new JQuery('<li><a tabindex="-1" href="#">${text}</a></li>').click(action);

            }
            itemElement.appendTo(menu);
        }
    }
}

enum DropdownItem {
    DropdownButton(text: String, action: Event -> Void);
    DropdownDivider;
}

enum DropdownAlignment {
    DropdownAlignRight;
    DropdownAlignLeft;
}
