package precog.editor;

import precog.editor.codemirror.Externs;
import js.Browser.document;
import js.html.Element;
import js.html.Event;

class Region {
    public var mode: RegionMode;

    public var element: Element;
    public var editor: RegionEditor;
    var toolbarElement: Element;

    static function editorForMode(mode: RegionMode, region: Region) {
        return switch(mode) {
        case QuirrelRegionMode: new QuirrelEditor(region);
        case MarkdownRegionMode: new MarkdownEditor(region);
        case JSONRegionMode: new JSONEditor(region);
        }
    }

    public function new(mode: RegionMode) {
        this.mode = mode;

        element = document.createElement('div');
        element.className = 'region';

        toolbarElement = Toolbar.element(this);
        element.appendChild(toolbarElement);

        editor = editorForMode(mode, this);
        element.appendChild(editor.element);

        element.addEventListener('mouseover', mouseOver, false);
        element.addEventListener('mouseout', mouseOut, false);
    }

    function mouseOver(event: Event) {
        element.className = 'region hover';
        toolbarElement.style.display = 'block';
    }

    function mouseOut(event: Event) {
        element.className = 'region';
        toolbarElement.style.display = 'none';
    }
}
