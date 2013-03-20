package precog.editor;

import js.html.Element;

interface RegionEditor {
    var element: Element;
    function getContent(): String;
    function setContent(content: String): Void;
    function evaluate(): Void;
    function focus(): Void;
}
