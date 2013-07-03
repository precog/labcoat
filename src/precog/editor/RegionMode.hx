package precog.editor;

using StringTools;

enum RegionMode {
    QuirrelRegionMode;
    MarkdownRegionMode;
    JSONRegionMode;
}

class RegionModes {
	public static function toEnglish(mode : RegionMode)
	{
		return switch(mode) {
			case _:
				("" + mode).replace("RegionMode", "");
		};
	}
}