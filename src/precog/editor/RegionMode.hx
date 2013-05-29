package precog.editor;

using StringTools;

enum RegionMode {
    QuirrelRegionMode;
    MarkdownRegionMode;
    JSONRegionMode;
    VegaRegionMode;
    PolychartCodeRegionMode;
}

class RegionModes {
	public static function toEnglish(mode : RegionMode)
	{
		return switch(""+mode) {
			case "PolychartCodeRegionMode":
				"Polychart Code";
			case s:
				s.replace("RegionMode", "");
		};
	}
}