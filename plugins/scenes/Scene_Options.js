modify_Scene_Options = class {
	start() {
		PP.Scene_Options.start.apply(this, arguments);
		this.startFadeIn(this.fadeSpeed(), false);
	}
}