package precog.labcoat.editor.codemirror;

import js.html.Node;

typedef Pos = {
    line: Int,
    ch: Int
};

typedef BookMark = {
    line: Int,
    ch: Int,
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

@:native("CodeMirror") extern class CodeMirror {
    static var keyMap: {
      macDefault: Dynamic,
      pcDefault: Dynamic
    };
    @:overload(function(event: String, callback: CodeMirror -> ChangeObj -> Void): Void {})
    function on(event: String, callback: CodeMirror -> Void): Void;
    function markText(from: Pos, to: {line: Int}, options: {replacedWith: Node, atomic: Bool}): Void;
    function getCursor(?start: String): Pos;
    function findMarksAt(pos: {line: Int}): Array<BookMark>;
    function getAllMarks(): Array<BookMark>;
    function addLineWidget(line: Int, node: Node, options: {?coverGutter: Bool, ?noHScroll: Bool, ?above: Bool, ?showIfHidden: Bool}): BookMark;
    function getLine(n: Int): String;
    function firstLine(): Int;
    function lastLine(): Int;
    function lineInfo(line: Int): {line: Int, text: String, widgets: Array<Widget>};
}

class CodeMirrorFactory {
    public static function create(elem: Node, ?options: {?lineNumbers: Bool}): CodeMirror untyped {
        return CodeMirror(elem, options);
    }
}
