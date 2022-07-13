modify_Window_Options = class {
	initialize() {
		PP.Window_Options.initialize.apply(this, arguments);

		this.contents.fontSize = 8;
	}

	resetFontSettings() {
		this.contents.fontFace = $gameSystem.mainFontFace();
		this.contents.fontSize = 14;
		this.resetTextColor();
	}

	itemHeight() {
		return PP.Window_Options.itemHeight.apply(this, arguments) - 6;
	}
}