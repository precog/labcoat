(function() {
    var gui = require('nw.gui');

    var applicationMenu = new gui.Menu({'type': 'menubar'});

    var applicationPrecogMenu = new gui.Menu();
    applicationPrecogMenu.append(new gui.MenuItem({'label':'Website'}));
    applicationMenu.append(new gui.MenuItem({'label': 'Precog', 'submenu': applicationPrecogMenu}));

    gui.Window.get().menu = applicationMenu;

    var contextMenu = new gui.Menu();
    contextMenu.append(new gui.MenuItem({'label': 'One!'}));
    contextMenu.append(new gui.MenuItem({'label': 'Two!'}));

    function popupMenu(event) {
        event.preventDefault();
        contextMenu.popup(event.clientX, event.clientY);
        return false;
    }

    window.addEventListener('load', function() {
        document.body.addEventListener('contextmenu', popupMenu, false);
        return alert('Right client on the text!!');
    }, false);
})();
