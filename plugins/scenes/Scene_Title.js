modify_Scene_Title = class {
	create() {
		PP.Scene_Title.create.apply(this, arguments);

		this._titleButtons = [];

		const newGame = new TitleButton(this, "Create New World", Graphics.width * 0.75, 28);
		newGame.move(Graphics.width / 2, 300 + (28 * 0));
		newGame.onClick = () => {
			this._commandWindow.close();
			SceneManager.push(Scene_WorldSetup);
		};
		this.addChild(newGame);
		this._titleButtons.push(newGame);

		const loadGame = new TitleButton(this, "Load Existing World", Graphics.width * 0.75, 28);
		loadGame.move(Graphics.width / 2, 300 + (28 * 1));
		loadGame.onClick = this.commandContinue.bind(this);
		this.addChild(loadGame);
		this._titleButtons.push(loadGame);

		const settings = new TitleButton(this, "Edit Settings", Graphics.width * 0.75, 28);
		settings.move(Graphics.width / 2, 300 + (28 * 2));
		settings.onClick = this.commandOptions.bind(this);
		this.addChild(settings);
		this._titleButtons.push(settings);

		const quitGame = new TitleButton(this, "Exit Game", Graphics.width * 0.75, 28);
		quitGame.move(Graphics.width / 2, 300 + (28 * 3));
		quitGame.onClick = function() {
			window.close();
		}
		this.addChild(quitGame);
		this._titleButtons.push(quitGame);

		this._overlay = new Sprite(new Bitmap(Graphics.width, Graphics.height));
		this._overlay.bitmap.fillAll("#000000");
		this._overlay.alpha = 0;
		this.addChild(this._overlay);
	}

	start() {
		PP.Scene_Title.start.apply(this, arguments);

		this.setSelected(this._titleButtons[0]);
	}

	createCommandWindow() {
		const rect = this.commandWindowRect();
		this._commandWindow = new Window_TitleCommand(rect);
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

	update() {
		Scene_Base.prototype.update.call(this);

		if(TouchInput.isTriggered()) {
			if(this._currentTitleButton && this._currentTitleButton.isBeingTouched()) {
				for(const button of this._titleButtons) {
					button.setNotClicked();
				}
				this._currentTitleButton.setClicked();
			}
		}
	}

	isBusy() {
		if(this._overlay.alpha < 1) {
			this._overlay.alpha += 0.1;
			if(this._overlay.alpha > 1) this._overlay.alpha = 1;
			return true;
		}
		return PP.Scene_Title.isBusy.apply(this, arguments);
	}

	terminate() {
		PP.Scene_Title.terminate.apply(this, arguments);
		if(this._overlay) {
			this._overlay.bitmap.destroy();
		}
	}
}