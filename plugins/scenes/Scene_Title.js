modify_Scene_Title = class {
	create() {
		PP.Scene_Title.create.apply(this, arguments);

		this._grassFloorHolder = new Sprite();
		this._grassFloorHolder.move(Graphics.width / 2, 200);
		this._grassFloorHolder.anchor.set(0.5);
		this._grassFloorHolder.scale.set(2.5, 1);
		this.addChild(this._grassFloorHolder);

		this._grassFloor = new Sprite(ImageManager.loadTitle1("GrassPlatform"));
		this._grassFloor.anchor.set(0.5);
		this._grassFloorHolder.addChild(this._grassFloor);

		this._entities = new Sprite();
		this.entData = [];

		const possibleImages = ["Tree", "SmallTree", "SandPillar"];
		for(let i = 0; i < 7; i++) {
			const img = possibleImages[Math.floor(Math.random() * possibleImages.length)];

			const baseDist = 20 + Math.floor(70 * Math.random());
			const baseRot = ((Math.random() * 0.05) + (i / 7));

			const rand = Math.random() < 0.5 ? 1 : Math.floor(Math.random() * 5) + 2;

			for(let i = 0; i < rand; i++) {
				const obj = new Sprite(ImageManager.lTile(img));
				obj.anchor.set(0.5, 0.9);
				obj.scale.set(2);
				this._entities.addChild(obj);
				this.entData.push([obj, (baseRot + ((Math.random() + 1) * 0.1)) * Math.PI * 2, baseDist + ((Math.random() + 1.5) * 30)]);
			}
		}

		for(let i = 0; i < 48; i++) {
			const obj = new Sprite(ImageManager.lTile("GodColumn"));
			obj.anchor.set(0.5, 0.9);
			obj.scale.set(2);
			this._entities.addChild(obj);
			this.entData.push([obj, (i / 24) * Math.PI * 2, 180]);
		}

		this.addChild(this._entities);

		this._titleText = PP.makeText("Psychic\nPlayground", 60);
		this._titleText.anchor.set(0.5, 1);
		this._entities.addChild(this._titleText);
		this.entData.push([this._titleText, 0, 0]);

		this._shadowText = PP.makeText("Psychic\nPlayground", 60);
		this._shadowText.style.fill = 0x000000;
		this._shadowText.scale.set(1 / 2.5, 1);
		this._shadowText.transform.skew.set(0.2, 0);
		this._shadowText.alpha = 0.5;
		this._shadowText.filters = [new PIXI.filters.BlurFilter(2)];
		this._grassFloorHolder.addChild(this._shadowText);

		this._midPoint = [Graphics.width / 2, 200];
		this._xScale = 2.5;
		this._yScale = 1;





		this._commandBack = new Sprite(ImageManager.loadTitle1("CommandBack"));
		this._commandBack.anchor.set(0, 0.5);
		this._commandBack.move(Graphics.width / 2, 342);
		this._commandBack.scale.set(2, 2.3);
		this.addChild(this._commandBack);

		this._commandBack2 = new Sprite(ImageManager.loadTitle1("CommandBack"));
		this._commandBack2.anchor.set(0, 0.5);
		this._commandBack2.move(Graphics.width / 2, 342);
		this._commandBack2.scale.set(-2, 2.3);
		this.addChild(this._commandBack2);






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

		this._grassFloor.rotation += 0.004;

		for(const obj of this.entData) {
			obj[0].x = this._midPoint[0] + (Math.cos(this._grassFloor.rotation + obj[1]) * obj[2] * this._xScale);
			obj[0].y = this._midPoint[1] + (Math.sin(this._grassFloor.rotation + obj[1]) * obj[2] * this._yScale);
		}

		this._entities.children.sort((a, b) => {
			if(a.y !== b.y) {
				return a.y - b.y;
			}
			return a.spriteId - b.spriteId;
		});

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