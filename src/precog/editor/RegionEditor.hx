package precog.editor;

import jQuery.JQuery;

interface RegionEditor {
    var element: JQuery;
    function getContent(): String;
    function setContent(content: String): Void;
    function evaluate(): Void;
    function focus(): Void;
}
