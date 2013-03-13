package precog.labcoat.editor;

import precog.labcoat.editor.codemirror.Externs;
import js.Browser.document;

using StringTools;

class Main {
    //static var lineWidgets: Map<Int, {clear: Void -> Void}> = new Map();

    static function main() {
        var editor = CodeMirrorFactory.create(document.body, {lineNumbers: true});
        Reflect.setField(CodeMirror.keyMap.macDefault, "Cmd-Enter", updateLineWidget);
        Reflect.setField(CodeMirror.keyMap.pcDefault, "Ctrl-Enter", updateLineWidget);
    }

    static function updateLineWidget(editor: CodeMirror) {
        var line = editor.getCursor().line;
        var lineContent = editor.getLine(line);
        addFigure(editor, line, lineContent);
    }

    static function addFigure(editor: CodeMirror, line: Int, figureContent: String) {
        //if(lineWidgets.exists(line)) lineWidgets.get(line).clear();

        var lineWidgets = editor.lineInfo(line).widgets;

        if(lineWidgets != null) {
            for(widget in lineWidgets) {
                widget.clear();
            }
        }

        var node = document.createElement('div');
        node.className = 'editor-figure';
        node.textContent = Date.now().getTime() + ': ' + try {
            js.Lib.eval(figureContent);
        } catch(error: Dynamic) {
            error;
        }

        var widget = editor.addLineWidget(line, node, {});
        //lineWidgets.set(line, widget);
    }

    /*static function removeFigure(editor: CodeMirror, line: Int) {
        if(!lineWidgets.exists(line)) return;

        lineWidgets.get(line).clear();
        lineWidgets.remove(line);
    }*/
}
