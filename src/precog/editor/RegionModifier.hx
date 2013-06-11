package precog.editor;

import jQuery.JQuery;
import precog.html.Bootstrap;
import precog.html.HtmlButton;
import precog.html.Icons;
import precog.macro.ValueClass;
import precog.util.Locale;

enum RegionModifier {
    Hidable;
    Deletable;
}

class RegionModifiers {
    static var modifierButtons: Map<RegionModifier, Region -> Locale -> HtmlButton> = {
        var buttons = new Map<RegionModifier, Region -> Locale -> HtmlButton>();

        function makeButton(label: String, icon: String, classes: String) {
            var button = new HtmlButton(label, icon, Mini, true);
            button.type = Flat;
            button.element.addClass(classes);
            return button;
        }

        buttons.set(Hidable, function(region: Region, locale: Locale) {
            var button = makeButton(locale.singular('show/hide'), Icons.eyeClose, 'show-hide');
            button.element.click(function showHideContent(_) {
                button.leftIcon = region.element.find('.content .editor').toggle().is(':visible') ? Icons.eyeClose : Icons.eyeOpen;
            });
            return button;
        });
        buttons.set(Deletable, function(region: Region, locale: Locale) {
            var button = makeButton(locale.singular('delete'), Icons.remove, 'delete');
            button.element.click(function(_) {
                Dialog.confirm("Are you sure you want to delete this region?", function() {
                    region.events.delete.trigger(region);
                });
            });
            return button;
        });

        buttons;
    }

    var modifiers: Array<RegionModifier>;

    public function new(modifiers) {
        this.modifiers = modifiers;
    }

    public function contains(modifier: RegionModifier) {
        return Lambda.indexOf(modifiers, modifier) != -1;
    }

    public function toButtons(region: Region, locale: Locale) {
        var buttons = [];
        for(modifier in modifiers) {
            if(!modifierButtons.exists(modifier)) continue;
            buttons.push(modifierButtons[modifier](region, locale));
        }
        return buttons;
    }
}
