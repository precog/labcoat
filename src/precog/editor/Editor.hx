package precog.editor;

import jQuery.JQuery;

@:build(precog.macro.Catamorphism.build(['CodeEditor', 'Notebook']))
@:autoBuild(precog.macro.Catamorphism.autoBuild(['CodeEditor', 'Notebook']))
interface Editor {
    var name(get, set): String;
    var element(default, null): JQuery;

    function show(): Void;
    function clear(): Void;
}
