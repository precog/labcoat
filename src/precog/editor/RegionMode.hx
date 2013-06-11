package precog.editor;

using StringTools;

enum RegionMode {
    QuirrelRegionMode;
    MarkdownRegionMode;
    JSONRegionMode;
    PolychartRegionMode;
}

class RegionModes {
	public static function toEnglish(mode : RegionMode)
	{
		return switch(mode) {
			case PolychartRegionMode:
				"Charts";
			case _:
				("" + mode).replace("RegionMode", "");
		};
	}
}