class Scene_EscMenu extends Stage {
	constructor(resumeCallback) {
		super();

		this.alpha = 0;

		this._overlay = new Sprite(new Bitmap(Graphics.width, Graphics.height));
		this._overlay.bitmap.fillAll("#000000");
		this._overlay.alpha = 0.75;
		this.addChild(this._overlay);

		this._controls = new Sprite(ImageManager.lUi("Controls"));
		this.addChild(this._controls);

		this._titleButtons = [];

		const x = Graphics.width / 2;
		const y = Graphics.height * 0.5;

		this.makeButton("Resume", x, y - 42, resumeCallback);
		this.makeButton("Settings", x, y - 14, this.settings.bind(this));
		this.makeButton("Go To Title", x, y + 14, this.title.bind(this));
		this.makeButton("Quit Game", x, y + 42, this.quit.bind(this));

		this.setSelected(this._titleButtons[0]);
	}

	makeButton(text, x, y, onclick) {
		const b = new TitleButton(this, text, 200, 28);
		b.move(x, y);
		b.onClick = onclick;
		this.addChild(b);
		this._titleButtons.push(b);
	}

	settings() {
		SceneManager.push(Scene_Options);
	}

	title() {
		SceneManager.push(Scene_Title);
	}

	quit() {
		window.close();
	}

	update() {
		if(this._destroyedSelf) {
			this.alpha -= 0.1;
			if(this.alpha <= 0) {
				this.terminate();
			}
			return;
		} else if(this.alpha < 1) {
			this.alpha += 0.1;
		}

		for(const button of this._titleButtons) {
			if(this._destroyedSelf) return;
			button.update();
		}

		if(TouchInput.isTriggered()) {
			if(this._currentTitleButton && this._currentTitleButton.isBeingTouched()) {
				for(const button of this._titleButtons) {
					button.setNotClicked();
				}
				this._currentTitleButton.setClicked();
			}
		}
	}

	setSelected(button) {
		if(this._currentTitleButton !== button) {
			this._currentTitleButton = button;
			if(!this._titleButtons) return;
			for(const button of this._titleButtons) {
				button.setSelected(button === this._currentTitleButton);
			}
		}
	}

	destroySelf() {
		this._destroyedSelf = true;
		this._titleButtons = [];
	}

	terminate() {
		this.parent.removeChild(this);
		this._overlay.bitmap.destroy();
		this.destroy();
	}
}