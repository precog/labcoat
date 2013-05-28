package precog.html;

import js.html.File;
import js.html.FileReader;
import labcoat.message.PrecogRequest;
import labcoat.message.PrecogResponse;
import precog.communicator.Communicator;
import precog.fs.Node;
import precog.html.HtmlTree;
import precog.geom.IRectangle;
import jQuery.JQuery;
using precog.html.JQuerys;

class FSHtmlTreeRenderer implements IHtmlTreeRenderer<Node>
{
	var communicator: Communicator;
	var height : Float;
	var connectorWidth : Float;
	var toggleWidth : Float = 10;
	var margin : Float = 0;
	var tree : HtmlTree<Node>;
	public function new(communicator: Communicator, height : Float, connectorWidth : Float = 10)
	{
		this.communicator = communicator;
		this.connectorWidth = connectorWidth;
		this.height = height;
	}
	public function setTree(tree : HtmlTree<Node>) : Void
	{
		this.tree = tree;
		tree.events.deselect.on(ondeselect);
		tree.events.select.on(onselect);
	}
	public function getRowHeight(rect : IRectangle) : Float
		return height;
	public function initRow(el : JQuery) : JQuery
	{
		el.html('<div class="tree-toggle" style="position:absolute"><i></i></div><div class="tree-content" style="white-space:nowrap"></div>');
		el.find(".tree-content")
			.clickOrDblClick(
				function(e) {
					e.preventDefault();
					tree.select(cast el.prop("data-node"));
					return false;
				},
				function(e) {
					e.preventDefault();
					tree.trigger(cast el.prop("data-node"));
					return false;
				}
			);

		el.bind('dragover', null, function(event: jQuery.Event) {
			event.stopPropagation();
			event.preventDefault();
			el.addClass("badge badge-light");
		});
		el.bind('dragleave', null, function(event: jQuery.Event) {
			event.stopPropagation();
			event.preventDefault();
			el.removeClass("badge badge-light");
		});
		el.bind('drop', null, function(event: jQuery.Event) {
			event.stopPropagation();
			event.preventDefault();
			el.removeClass("badge badge-light");

			var originalEvent = untyped event.originalEvent;

			var files: Array<File> = untyped originalEvent.target.files || originalEvent.dataTransfer.files;

			for(file in files) {
				var reader = new FileReader();
				reader.onload = function(event: Dynamic) {
					var node = cast el.prop("data-node");
					var type = if(file.type == "") filenameToMimeType(file.name) else file.type;
					communicator.request(new RequestFileUpload('${node.data}/${file.name}', type, event.target.result), ResponseFileUpload);
				};
				reader.readAsBinaryString(file);
			}
		});

		return el;
	}
	function filenameToMimeType(filename: String): String {
		var extension = filename.split('.').pop();
		return switch(extension) {
		case 'json':
			'application/json';
		case 'md':
			'text/x-markdown';
		case 'markdown':
			'text/x-markdown';
		case 'qrl':
			'text/x-quirrel-script';
		default:
			'text/plain';
		}
	}
	public function updateRow(el : JQuery, node : TreeNode<Node>) : JQuery
	{
		el.prop("data-node", cast node); // The case is needed due to a limitation in jQuery Extern lib

		if(node == tree.selected)
			el.addClass("badge badge-light");

		var hwidth = (1 + node.level) * connectorWidth + margin,
			label  = Std.string(node.data).split("/").pop();
//		if(label == "")
//			label = "/";

		var icon,
			metatype = node.data.meta.get("type");
		if(null != metatype) {
			icon = 'icon-' + switch(metatype) {
				case "notebook" :	"book";
				case _:				"file";
			};
		} else if(node.data.isFile) {
			icon = 'icon-file';
		} else if(node.collapsed) {
			icon = 'icon-folder-close-alt';
		} else {
			icon = 'icon-folder-open-alt';
		}

		el.find(".tree-content")
			.css("margin-left", '${hwidth}px')
			.html('<i class="$icon"></i> ' + label);

		var toggle = el.find(".tree-toggle");
		if(node.collapsed || node.hasChildren) {
			toggle
				.off("click")
				.on("click", function() {
					if(node.collapsed)
					{
						tree.expand(node);
					} else {
						tree.collapse(node);
					}
					node.toggle();
					tree.update();
				});
			if(node.collapsed) {
				toggle.find("i").removeClass("icon-caret-down").addClass("icon-caret-right");
			} else {
				toggle.find("i").removeClass("icon-caret-right").addClass("icon-caret-down");
			}
			toggle.css("left", (hwidth-toggleWidth-margin)+"px");
			toggle.show();
		} else {
			toggle.hide();
		}
		return el;
	}

	function onselect(node : TreeNode<Node>)
	{
		if(null == node) return;
		var el = tree.getElementForNode(node);
		if(null == el) return;
		el.addClass("badge badge-light");
	}

	function ondeselect(node : TreeNode<Node>)
	{
		if(null == node) return;
		var el = tree.getElementForNode(node);
		if(null == el) return;
		el.removeClass("badge badge-light");
	}
}