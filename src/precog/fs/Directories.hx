package precog.fs;

class Directories extends Nodes<Directory>
{
	public function find(segment : Segment) : Array<Directory>
	{
		return switch (segment.getESegment()) {
			case Literal(literal):
				nodes.filter(function(node) return literal == node.name);
			case Pattern(p, m):
				var reg = new EReg(p, m);
				nodes.filter(function(node) return reg.match(node.name));
			case Up:
				if(directory.parent == null)
					throw "no parent directory for " + directory.toString();
				[directory.parent];
			case Current:
				[directory];
		}
	}

	public function pick(segment : Segment) : Directory
	{
		return find(segment)[0];
	}
}