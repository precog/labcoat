package precog.editor;

using StringTools;

enum RegionMode {
    QuirrelRegionMode;
    MarkdownRegionMode;
    JSONRegionMode;
    VegaRegionMode;
    PolychartCodeRegionMode;
    PolychartBuilderRegionMode;
}

class RegionModes {
	public static function toEnglish(mode : RegionMode)
	{
		return switch(""+mode) {
			case "PolychartCodeRegionMode":
				"Poly Code";
			case "PolychartBuilderRegionMode":
				"Poly UI";
			case s:
				s.replace("RegionMode", "");
		};
	}
}