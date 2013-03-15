package precog.labcoat.editor;

import precog.labcoat.editor.codemirror.Externs;
import js.Browser.document;

class Main {
    static function main() {
        var editor = CodeMirrorFactory.create(document.body, {lineNumbers: true, gutters: ['editor-region']});
        Reflect.setField(CodeMirror.keyMap.macDefault, "Shift-Enter", makeOrEvaluateRegion);
        Reflect.setField(CodeMirror.keyMap.pcDefault, "Shift-Enter", makeOrEvaluateRegion);
        Reflect.setField(CodeMirror.keyMap.macDefault, "Cmd-Enter", insertRegion);
        Reflect.setField(CodeMirror.keyMap.pcDefault, "Ctrl-Enter", insertRegion);
    }

    static function insertRegion(editor: CodeMirror) {
        clearCurrentRegion(editor);
        makeOrEvaluateRegion(editor);
    }

    static function clearCurrentRegion(editor: CodeMirror) {
        var region = currentRegion(editor);
        var pos = if(region != null) region.find() else null;
        if(region == null || pos == null) return;

        // Delete the current region make a new one from its new start.
        var nextLine = editor.getCursor().line + 1;
        if(pos.to.line < nextLine) return;
        region.clear();
        markText(
            editor,
            {
                line: nextLine,
                ch: 0
            },
            pos.to
        );
    }

    static function makeOrEvaluateRegion(editor: CodeMirror) {
        var pos = makeRegion(editor).find();
        if(pos == null) return;
        updateOutput(editor, pos.from, pos.to);
    }

    static function clearMarkers(editor: CodeMirror, line: Int) {
        var lineInfo = editor.lineInfo(line);

        var lineWidgets = lineInfo.widgets;
        if(lineWidgets != null) {
            for(widget in lineWidgets) {
                widget.clear();
            }
        }

        var lineGutters = lineInfo.gutterMarkers;
        if(lineGutters != null) {
            for(gutterId in Reflect.fields(lineGutters)) {
                editor.setGutterMarker(line, gutterId, null);
            }
        }
    }

    static function makeRegion(editor: CodeMirror) {
        var region = currentRegion(editor);
        if(region != null && region.find() != null) return region;

        var marks = editor.getAllMarks();
        var line = editor.getCursor().line;

        var from = {line: editor.firstLine(), ch: 0};
        for(mark in marks) {
            if(mark.find() == null) continue;

            var pos = mark.find();
            if(line < pos.from.line) break;

            from.line = pos.to.line + 1;
        }

        var to = {line: line, ch: editor.getLine(line).length};

        return markText(editor, from, to);
    }

    static function markText(editor: CodeMirror, from: Pos, to: Pos) {
        return editor.markText(from, to, {inclusiveLeft: true, inclusiveRight: false});
    }

    static function currentRegion(editor: CodeMirror) {
        var cursorLine = editor.getCursor().line;
        var marks = editor.findMarksAt({line: cursorLine, ch: 0});
        if(marks == null || marks.length == 0) return null;
        return marks[0];
    }

    static function updateOutput(editor: CodeMirror, from: Pos, to: Pos) {
        var codeFrom = from;
        var toLineContent = editor.getLine(to.line);
        var codeTo = {line: to.line, ch: if(toLineContent != null) toLineContent.length else 0};
        var code = editor.getRange(codeFrom, codeTo);
        var output = Date.now().getTime() + ': ' + try {
            js.Lib.eval(code);
        } catch(error: Dynamic) {
            error;
        }

        clearMarkers(editor, to.line);

        var b = document.createElement('div');
        b.innerHTML = "=";
        editor.setGutterMarker(to.line, 'editor-region', b);

        var node = document.createElement('div');
        node.className = 'editor-figure';
        node.textContent = output;

        editor.addLineWidget(to.line, node, {coverGutter: true});
    }

    static function insertNewline(editor: CodeMirror) {
        // What CodeMirror does to insert a newline
        editor.replaceSelection("\n", "end", "+input");
    }
}
