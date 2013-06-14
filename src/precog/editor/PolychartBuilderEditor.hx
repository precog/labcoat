package precog.editor;

import labcoat.message.PrecogNamedConfig;
import labcoat.message.PrecogRequest;
import labcoat.message.PrecogResponse;
import precog.communicator.Communicator;
import jQuery.JQuery;
import precog.html.HtmlButton;
import precog.html.Icons;
import precog.util.ValueType;
using thx.react.Promise;
using thx.core.Strings;
using StringTools;

class PolychartBuilderEditor implements RegionEditor {
    public var element: JQuery;
    var editorContainer: JQuery;
    var showHideButton: HtmlButton;
    var region: Region;
    var communicator: Communicator;
    var credential : labcoat.message.PrecogConfig;
    var basePath : String;
    var context : Editor;
    var iframe : js.html.IFrameElement;

    public function new(context : Editor, communicator: Communicator, region: Region, editorToolbar: JQuery) {
        this.context = context;
        this.communicator = communicator;
        this.region = region;

        element = new JQuery('<div class="polychart-ui"></div>');
        editorContainer = new JQuery('<div class="editor"></div>').appendTo(element);
        
        var refreshButton = new HtmlButton('refresh', Icons.refresh, Mini);
        refreshButton.type = Flat;
        refreshButton.element.click(function(_) buildEditor());
        editorToolbar.append(refreshButton.element);

        haxe.Timer.delay(function() {
            communicator.consume(function(data : Array<PrecogNamedConfig>) {
                credential = data[0].config;
                buildEditor();
            });
        }, 0);
    }

    function buildEditor()
    {
        editorContainer.children().remove();

        var iframeElement = new JQuery('<iframe class="polychart" frameborder="0" marginheight="0" marginwidth="0"></iframe>').appendTo(editorContainer);
        iframe = cast iframeElement.get(0);
        var doc : Dynamic = untyped iframe.contentWindow || iframe.contentDocument;

        (untyped iframe.contentWindow).POLYCHART_SAVE_HANDLER = function(content) {
            setContent(content);
            evaluate();
        };

        getDataSources(function(datasources : Array<Datasource>) {

            var template = PolychartBuilderTemplate.HTML;
    //            template = template.replace("${code}", script);
            template = template.replace("${apiKey}", credential.apiKey);
            template = template.replace("${analyticsService}", credential.analyticsService);
            var path = region.path().split("/").slice(0, -1).join("/") + "/";
            template = template.replace("${path}", path);
            template = template.replace("${filePath}", region.path());
            //TODO use regiions to extract out
//            template = template.replace("${outs}", ["out1","out2"].map(function(o) return '"$o"').join(","));

            var sdatasources = serializeDatasources(datasources);
            template = template.replace("${datasources}", sdatasources);

            if(doc.document) {
                doc = doc.document;
            }
            doc.open();
            doc.write(template);
            doc.close();

        });
    }

    function getDataSources(callback : Array<Datasource> -> Void)
    {
        // TODO save datasources in content and retrieve for them ... if no datasources refresh as below
        context.cata(
            function(codeEditor: CodeEditor) {
                // TODO, what sources should be displayed in this case?
                callback([]);
            },
            function(notebook: Notebook) {
                var paths = getNotebookOutputPath(notebook),
                    promises = paths.map(function(path) {
                        return communicator.request(
                            new RequestMetadata('${region.directory}/$path'),
                            ResponseMetadata
                        );
                    });
                Promise.list(promises).then(function(results : Array<ResponseMetadata>) {
                    var dss = results.map(function(result) {
                            var name      = Strings.rtrim(result.parent, "/").split("/").pop(),
                                directory = Strings.rtrim(result.parent, "/").split("/").slice(0, -1).join("/");
                            return transformMetadataToDatasource(name, directory, result.metadata);
                        }).filter(function(ds) {
                            return ds.meta.iterator().hasNext();
                        });
                    callback(dss);
                });
            }
        );
        
    }

    function getNotebookOutputPath(notebook : Notebook) : Array<String>
    {
        var paths = [];
        for(other in notebook) {
            if(region == other) continue;
            switch (other.mode) {
                case JSONRegionMode, QuirrelRegionMode:
                    paths.push(other.filename);
                case _:
            }
        }
        return paths;
    }

    public function getContent() : String
    {
        if(null == iframe)
            return "[]";
        var win = iframe.contentWindow;
        if(null == untyped win.POLYCHART_SERIALIZED)
            return "[]";
        return untyped win.POLYCHART_SERIALIZED;
    }

    public function setContent(content : String)
    {
        if(null == iframe)
            return;
        var win = iframe.contentWindow;
        untyped win.POLYCHART_SERIALIZED = content;
    }

    public function focus()
    {
        
    }

    public function evaluate()
    {
        var definition = getContent();
        communicator.request(
            new RequestFileUpload(region.path(), "text/json", definition),
            ResponseFileUpload
        );
    }

    static function serializeDatasources(dss : Array<Datasource>)
    {
        return "[" + dss.map(function(ds) {
            var meta = {};
            for(key in ds.meta.keys())
                Reflect.setField(meta, key, { type : ds.meta.get(key) });
            return '{ name : "${escapeQuotes(ds.name)}", query : "${escapeQuotes(ds.query)}", meta : ${haxe.Json.stringify(meta)} }';
        }).join(", ") + "]";
    }

    static function escapeQuotes(s : String)
        return StringTools.replace(s, '"', '\\"');

    static function transformMetadataToDatasource(name : String, directory : String, metadata : Map<String, ValueType>)
    {
        var meta = new Map();
        for(key in metadata.keys())
        {
            var dimension = mapDimension(key, metadata.get(key));
            if(null == dimension)
                continue;
            meta.set(key, dimension);
        }
        return {
            name : name,
            query : "/" + directory + "/" + name,
            meta : meta
        };
    }

    static function mapDimension(name : String, valueType : ValueType)
    {
        return switch (valueType) {
            case Value(type, _) if(type != "Array"):
                switch(type) {
                    case "Bool":
                        "cat";
                    case "String", "Float" if(isDateName(name)):
                        "date";
                    case "String":
                        "cat";
                    case "Int" if(name.toLowerCase().startsWith("id") || name.toLowerCase().endsWith("id")):
                        "cat";
                    case "Int", "Float":
                        "num";
                    case _:
                        null;
                };
//            case Object(fields): // TODO can we use nested objects? what about arrays
            case _:
                null;
        };
    }

    static function isDateName(name : String)
    {
        return (~/(date|create|delete|creation|deletion|removed|time)/i).match(name);
    }
}

typedef Datasource =
{
    name : String,
    query : String,
    meta : Map<String, String>
}

/*
    Polychart Questions
    * is there an event for onchange (to save the chart)?
    * can we change data sources dynamically?
    * is it possible to visualize 2 data sources in the same chart? (not the same dashboard)
    * can we disable the default title "Untitled Dashboard"?
    * is there a way to define the size of the grid from the config object?
    * is there a way to snap to the grid but not display it? (or maybe only display when dragging/resizing)
      This is probably achievable with css I guess.

    TODO
    * add function to change datasource
*/

class PolychartBuilderTemplate
{
    public static var HTML = '
<script src="js/precog.js" type="text/javascript"></script>
<script src="poly/dependencies.js"></script>
<script src="poly/all.js"></script>

<link rel="stylesheet" type="text/css" href="poly/css/polychart.css" />

<div id="chart" class="polychart-ui"></div>
<script>
// DYNAMIC VARIABLES
    var apiKey = "$${apiKey}",
        analyticsService = "$${analyticsService}",
        sources = $${datasources},
        filePath = "$${filePath}";
// END OF DYNAMIC VARIABLES

var api  = new Precog.api({ analyticsService : analyticsService, apiKey : apiKey }),
    poly = require("poly");


function execute(result) {
    var config = (result && result.contents && JSON.parse(result.contents)) || [];
      polychart_global = poly.dashboard({
        dom: $("#chart")[0],
        header: false,
        showTutorial: false,
        width: "fill",
        height: "fill",
        demoData: [{
          type: "precog",
          api : api,
          sources: sources
        }],
        initial : config
    });

    polychart_global.onSave((function() {
        var timer;
        return function() {
          clearTimeout(timer);
          timer = setTimeout(function() {
            var content = JSON.stringify(polychart_global.serialize());
            window.POLYCHART_SERIALIZED = content;
            window.POLYCHART_SAVE_HANDLER && window.POLYCHART_SAVE_HANDLER(content);
          }, 1000)
        };
    })());
}

api.getFile(filePath).then(execute, execute);


</script>';
}
