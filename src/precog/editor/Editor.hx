package precog.editor;

import jQuery.JQuery;

@:build(precog.macro.Catamorphism.build(['CodeEditor', 'Notebook']))
@:autoBuild(precog.macro.Catamorphism.autoBuild(['CodeEditor', 'Notebook']))
interface Editor {
    var path(default, null): String;
    var element(default, null): JQuery;

    function save(dest: String): Void;
    function show(): Void;
    function clear(): Void;
}
