package precog.labcoat.editor.codemirror;

import js.html.Node;

typedef Pos = {
    line: Int,
    ch: Int
};

typedef BookMark = {
    > Pos,
    clear: Void -> Void
};

typedef ChangeObj = {
    from: Pos,
    to: Pos,
    text: Array<String>,
    origin: String,
    ?next: ChangeObj
};

typedef Widget = {
    coverGutter: Bool,
    noHScroll: Bool,
    above: Bool,
    showIfHidden: Bool,
    clear: Void -> Void,
    changed: Void -> Void
};

typedef TextMarker = {
    lines: Array<Int>,
    type: String,
    doc: CodeMirror,
    clear: Void -> Void,
    find: Void -> {from: Pos, to: Pos},
    getOptions: Bool -> {className: String, atomic: Bool, collapsed: Bool}
};

@:native("CodeMirror") extern class CodeMirror {
    static var keyMap: {
      macDefault: Dynamic,
      pcDefault: Dynamic
    };

    @:overload(function(event: String, callback: CodeMirror -> ChangeObj -> Void): Void {})
    function on(event: String, callback: CodeMirror -> Void): Void;

    function markText(from: Pos, to: Pos, options: {?className: String, ?replacedWith: Node, ?atomic: Bool, ?inclusiveLeft: Bool, ?inclusiveRight: Bool}): TextMarker;
    function findMarksAt(pos: Pos): Array<TextMarker>;
    function getAllMarks(): Array<TextMarker>;

    function setGutterMarker(line: Int, gutter: String, value: Node): {clear: Void -> Void};

    function getCursor(?start: String): Pos;
    function getRange(from: Pos, to: Pos): String;

    function addLineWidget(line: Int, node: Node, options: {?coverGutter: Bool, ?noHScroll: Bool, ?above: Bool, ?showIfHidden: Bool}): BookMark;
    function getLine(n: Int): String;
    function firstLine(): Int;
    function lastLine(): Int;
    function lineInfo(line: Int): {line: Int, text: String, widgets: Array<Widget>, gutterMarkers: Dynamic};

    function replaceSelection(text: String, ?collapse: String, ?origin: String): Void;
}

class CodeMirrorFactory {
    public static function create(elem: Node, ?options: {?lineNumbers: Bool, ?gutters: Array<String>}): CodeMirror untyped {
        return CodeMirror(elem, options);
    }
}
