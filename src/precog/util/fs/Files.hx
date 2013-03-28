package precog.util.fs;

class Files extends Nodes<File>
{
	public function find(segment : Segment) : Array<File>
	{
		return switch (segment.getESegment()) {
			case Literal(literal):
				nodes.filter(function(node) return literal == node.name);
			case Pattern(reg):
				nodes.filter(function(node) return reg.match(node.name));
			case _:
				throw "cannot traverse directories to find files";
		}
	}

	public function pick(segment : Segment) : File
	{
		return find(segment)[0];
	}
}