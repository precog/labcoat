package precog.geom;

import thx.react.Suspendable;

@:access(precog.geom.Point)
class Rectangle extends Suspendable<IRectangle> implements IRectangleObservable
{
	public var x(default, null) : Float;
	public var y(default, null) : Float;
	public var width(default, null) : Float;
	public var height(default, null) : Float;
	public function new(x = 0.0, y = 0.0, width = 0.0, height = 0.0)
	{
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	public function clone()
		return new Rectangle(x, y, width, height);

	public function equals(other : IRectangle)
		return 
			x == other.x && y == other.y
			&&
			width == other.width && height == other.height;

	public function toString()
		return 'Rectangle($x, $y, $width, $height)';

		
	public function set(x : Float, y : Float, width : Float, height : Float)
	{
		if(this.x == x && this.y == y
			&&
			this.width == width && this.height == height) return;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		notify(true);
	}

	public function update(other : IRectangle)
	{
		set(other.x, other.y, other.width, other.height);
	}

	public function updateSize(other : IRectangle)
	{
		set(x, y, other.width, other.height);
	}

	public function addRectangle(other : IRectangle)
	{
		wrapSuspended(function() {
 			addPointXY(other.x, other.y);
			addPointXY(other.x + other.width, other.y + other.height);
		});
		return this;
	}

	public inline function addPoint(point : IPoint)
	{
		return addPointXY(point.x, point.y);
	}

	public function addPointXY(px : Float, py : Float)
	{
		var x = this.x,
			y = this.y,
			w = this.width,
			h = this.height;
		if(px < this.x) {
			x = px;
			w = this.x + this.width - x;
		} else if(px > this.x + this.width) {
			w = px - this.x;
		}
		if(py < this.y) {
			y = py;
			h = this.y + this.height - y;
		} else if(py > this.y + this.height) {
			h = py - this.y;
		}
		set(x, y, w, h);
		return this;
	}
/*
	var points : Array<Point>
	function getPoint(index)
	{
		if(null == points)
			points = [];
		var point = points[index];
		if(null == point)
		{
			points[index] = point = new Point(); // TODO
			var applyRect  = null,
				applyPoint = null;
			switch (index) {
				case 0: //TL
					applyRect  = function(r) point.setXY(r.x, r.y);
					applyPoint = function(p) this.set(p.x, p.y, this.width, this.height);
			}
			applRecty(this);
			addListener(applyRect);
			point.addListener(applyPoint);
		}
		return point;
	}
*/
}