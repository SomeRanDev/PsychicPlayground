modify_Scene_Boot = class {
	loadGameFonts() {
		PP.Scene_Boot.loadGameFonts.apply(this, arguments);
		FontManager.load("title-font", "DotGothic16-Regular.ttf");
	}
}
