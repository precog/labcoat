package precog.html;

import jQuery.JQuery;
import precog.geom.IRectangle;
import haxe.Timer;
using thx.react.IObservable;

class TreeNode<T>
{
	public var parent(default, null) : TreeNode<T>;
	public var level(default, null) : Int;
	public var before(default, null) : TreeNode<T>;
	public var after(default, null) : TreeNode<T>;
	public var firstChild(default, null) : TreeNode<T>;
	public var lastChild(default, null) : TreeNode<T>;
	public var tree(default, null) : Tree<T>;
	public var collapsed(default, null) : Bool;
	public var data : T;
	public function new(tree : Tree<T>, data : T)
	{
		this.tree = tree;
		this.data = data;
		this.collapsed = false;
	}

	public var hasChildren(get, null) : Bool;
	inline function get_hasChildren() 
		return firstChild != null;

	public function collapse()
	{
		if(collapsed) return;
		collapsed = true;
		tree.dirty = true;
	}

	public function expand()
	{
		if(!collapsed) return;
		collapsed = false;
		tree.dirty = true;
	}

	public function toggle()
	{
		if(collapsed)
			expand();
		else
			collapse();
	}

	public function appendChild(data : T)
	{
		var node = new TreeNode(tree, data);
		node.parent = this;
		node.level = level + 1;
		if(null != lastChild)
		{
			lastChild.after = node;
			node.before = lastChild;
		} else {
			firstChild = node;
		}
		lastChild = node;
		tree.dirty = true;
		return node;
	}

	public function prependChild(data : T)
	{
		var node = new TreeNode(tree, data);
		node.parent = this;
		node.level = level + 1;
		if(null != firstChild)
		{
			firstChild.before = node;
			node.after = firstChild;
		} else {
			lastChild = node;
		}
		firstChild = node;
		tree.dirty = true;
		return node;
	}

	public function insertAfter(data : T)
	{
		var node = new TreeNode(tree, data);
		node.parent = parent;
		node.level = level;
		node.before = this;
		node.after = after;
		if(null != after)
			after.before = node;
		after = node;
		tree.dirty = true;
		return node;
	}

	public function insertBefore(data : T)
	{
		var node = new TreeNode(tree, data);
		node.parent = parent;
		node.level = level;
		node.before = before;
		node.after = this;
		if(null != before)
			before.after = node;
		before = node;
		tree.dirty = true;
		return node;
	}

	public function remove()
	{
		if(null != before)
			before.after = after;
		if(null != after)
			after.before = before;
		after = before = null;
		tree.dirty = true;
	}
}

@:access(precog.html.TreeNode)
class Tree<T>
{
	public var root(default, null) : TreeNode<T>;
	public function new() 
	{
		dirty = false;
		list = [];
	}

	public function addRoot(data : T)
	{
		if(null == root)
		{
			root = new TreeNode(this, data);
			root.level = 0;
			return root;
		} else {
			var end = root;
			while(null != end.after)
				end = end.after;
			return end.insertAfter(data);
		}
	}

	public function update()
	{
		if(!dirty || root == null) return;

		var start = root;
		while(null != start.before)
			start = start.before;
		root = start;
		list = [];
		traverse(root);

		dirty = false;
	}

	public var list(default, null) : Array<TreeNode<T>>;
	function traverse(node : TreeNode<T>)
	{
		list.push(node);
		if(!node.collapsed && null != node.firstChild)
			traverse(node.firstChild);
		if(null != node.after)
			traverse(node.after);
	}

	public var dirty : Bool;
}

class HtmlTree<T>
{
	var tree : Tree<T>;
	var rowHeight : Null<Float>;
	var sampler : Void -> Void;
	var height : Float;

	var scroller : JQuery;
	var rows : Array<JQuery>;
	var renderer : IHtmlTreeRenderer<T>;

	public var panel : HtmlPanel;

	public function new(panel : HtmlPanel, renderer : IHtmlTreeRenderer<T>)
	{
		this.panel = panel;
		scroller = new JQuery('<div clss="tree-scroller" style="position:absolute;width:100%"></div>');
		tree = new Tree();
		this.renderer = renderer;
		renderer.setTree(this);
		// init elements
		panel.element.addClass("tree");
		panel.element.css("overflow", "auto");
		panel.element.append(scroller);
		panel.element.scroll(function(_) delayedUpdate());
		// update rows
		panel.panel.rectangle.addListener(function(rect) {
			calculateRowHeight();
			update();
		});
		rows = [];
		calculateRowHeight();
	}

	function createRow()
	{
		return renderer.initRow(new JQuery('<div class="tree-row" style="position:absolute"></div>'));
	}

	public function addRoot(data : T)
	{
		return tree.addRoot(data);
	}

	var timer : Timer;
	public function delayedUpdate()
	{
		if(null != timer)
			timer.stop();
		timer = Timer.delay(function() {
			update();
			timer = null;
		}, 50);
	}

	public function update()
	{
		tree.update();
		var 
			scroll          = panel.element.scrollTop(),
			start_index     = Math.floor(scroll / rowHeight),
			items_total     = tree.list.length,
			height_total    = items_total * rowHeight,
			height_page     = panel.panel.rectangle.height,
			items_page      = Math.ceil(height_page / rowHeight) * 2 + 1, // look ahead 1 page
			items_visibles  = Math.round(Math.min(items_total - start_index, items_page)),
			height_scroller = Math.max(height_page, height_total)
		;

		// remove excess
		while(rows.length > items_visibles)
			rows.pop().remove();
		// fill needed
		while(rows.length < items_visibles)
			rows.push(createRow().appendTo(scroller));

		// resize container
		if(height_scroller != scroller.outerHeight())
			scroller.css("height", height_scroller +"px");

		var top = scroll - scroll % rowHeight;
		// render nodes
		for(row in rows)
		{
			renderRow(row, top, start_index++);
			top += rowHeight;
		}
	}

	function renderRow(el : JQuery, top : Float, index : Int)
	{
		el.css("top", top + "px");
		renderer.updateRow(el, tree.list[index]);
	}

	// TODO implement
	function calculateRowHeight()
	{
		rowHeight = renderer.getRowHeight(panel.panel.rectangle);
	}
}

interface IHtmlTreeRenderer<T>
{
	public function setTree(tree : HtmlTree<T>) : Void;
	public function getRowHeight(rect : IRectangle) : Float;
	public function initRow(el : JQuery) : JQuery;
	public function updateRow(el : JQuery, node : TreeNode<T>) : JQuery;
}

class BaseHtmlTreeRenderer<T> implements IHtmlTreeRenderer<T>
{
	var height : Float;
	var connectorWidth : Float;
	var toggleWidth : Float = 10;
	var margin : Float = 2;
	var tree : HtmlTree<T>;
	public function new(height : Float, connectorWidth : Float = 12)
	{
		this.connectorWidth = connectorWidth;
		this.height = height;
	}
	public function setTree(tree : HtmlTree<T>) : Void
	{
		this.tree = tree;
	}
	public function getRowHeight(rect : IRectangle) : Float
		return height;
	public function initRow(el : JQuery) : JQuery
	{
		el.html('<div class="tree-toggle" style="position:absolute"><i></i></div><div class="tree-content" style="white-space:nowrap"></div>');
		return el;
	}
	public function updateRow(el : JQuery, node : TreeNode<T>) : JQuery
	{
		var hwidth = (1 + node.level) * connectorWidth + margin;
		el.find(".tree-content")
			.css("padding-left", '${hwidth}px')
			.html('<i class="' + (node.hasChildren ? 'icon-folder-${node.collapsed ? "close" : "open"}-alt' : 'icon-file' ) + '"></i> ' + Std.string(node.data));
		var toggle = el.find(".tree-toggle");
		if(node.collapsed || node.hasChildren) {
			toggle.get(0).onclick = function() {
				node.toggle();
				tree.update();
			};
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
}