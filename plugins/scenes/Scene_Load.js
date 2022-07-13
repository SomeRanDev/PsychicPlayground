modify_Scene_Load = class {
	start() {
		PP.Scene_Load.start.apply(this, arguments);
		this.startFadeIn(this.fadeSpeed(), false);
	}
}