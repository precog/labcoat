package precog.editor.codemirror;

import js.html.Node;
import js.html.Element;

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

typedef Config = {
    ?gutters: Array<String>,
    ?lineNumbers: Bool,
    ?lineWrapping: Bool,
    ?dragDrop: Bool,
    ?fixedGutter: Bool,
    ?pollInterval: Int,
    ?workDelay: Int,
    ?workTime: Int,
    ?viewportMargin: Int,
    ?mode: String,
    ?value: String
};

typedef ParserConfig = {
    mode: String
};

typedef StringStream = {
    start: Int,
    pos: Int,
    string: String,
    tabSize: Int,
    lastColumnValue: Int,
    eol: Void -> Bool,
    sol: Void -> Bool,
    match: Dynamic -> String,
    eatSpace: Void -> Bool,
    skipToEnd: Void -> Void,
    skipTo: String -> Bool,
    backUp: Int -> Void,
    column: Void -> Int,
    indentation: Void -> Int,
    current: Void -> String
};

@:native("CodeMirror") extern class CodeMirror {
    static var keyMap: {
      basic: Dynamic,
      macDefault: Dynamic,
      pcDefault: Dynamic
    };

    static function defineMode(mode: String, scope: Config -> ParserConfig -> {token: StringStream -> Dynamic -> String}): Void;

    @:overload(function(event: String, callback: CodeMirror -> ChangeObj -> Void): Void {})
    function on(event: String, callback: CodeMirror -> Void): Void;

    function getWrapperElement(): Element;

    function getValue(): String;
    function setValue(text: String): Void;

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

    function moveV(dir: Int, unit: String): Void;

    function replaceSelection(text: String, ?collapse: String, ?origin: String): Void;

    function getOption(option: String): Dynamic;

    function refresh(): Void;
    function focus(): Void;

    static function __init__() : Void
    {
        haxe.macro.Compiler.includeFile("precog/editor/codemirror/codemirror.js");
        haxe.macro.Compiler.includeFile("precog/editor/codemirror/codemirror.markdown.js");
    }
}

class CodeMirrorFactory {
    public static function addTo(elem: Node, ?options: Config): CodeMirror untyped {
        return CodeMirror(elem, options);
    }
    public static function create(callback: Node -> Void, ?options: Config): CodeMirror untyped {
        return CodeMirror(callback, options);
    }
}
