package precog.editor;

using StringTools;

enum RegionMode {
    QuirrelRegionMode;
    MarkdownRegionMode;
    JSONRegionMode;
    VegaRegionMode;
}

class RegionModes {
	public static function toEnglish(mode : RegionMode)
	{
		var s = ""+mode;
		return s.replace("RegionMode", "");
	}
}