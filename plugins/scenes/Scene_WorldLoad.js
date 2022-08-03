class Scene_WorldLoad extends Scene_Base {
	constructor() {
		super();

		this._messages = [
			"Generating world.",
			"Planting grass.",
			"Planting trees.",
			"Planting buildings.",
			"Planting flowers",
			"Touching pillars.",
			"Drawing map.",
			"Still drawing that map.",
			"Oh no, I made a mistake.",
			"Welp, you probably won't notice.",
			"Planting humans.",
			"Planting intelligence.",
			"Doing other stuff..."
		];

		this._endAnimation = 0;
		this._endAnimation2 = 0;
	}

	prepare(worldSettings, playerSettings) {
		this._worldSettings = worldSettings;
		this._playerSettings = playerSettings;
	}

	initialize() {
		super.initialize();
	}

	isReady() {
		return super.isReady() && $generation.isReady();
	}

	create() {
		this.loadingText = PP.makeText("0%", 24);
		this.loadingText.move(Graphics.width / 2, Graphics.height / 2);
		this.addChild(this.loadingText);

		this.messageText = PP.makeText("cfds", 24);
		this.messageText.move(Graphics.width / 2, (Graphics.height / 2) + 40);
		this.addChild(this.messageText);	
	}

	start() {
		super.start();
		this.startFadeIn(this.fadeSpeed(), false);

		this._genWidth = 256;
		this._genIndex = 0;
		this._genEnd = this._genWidth * this._genWidth;

		$generation.beginGeneration();
	}

	update() {
		super.update();
		if(this._genIndex < this._genEnd) {
			const next = Math.min(this._genIndex + 100, this._genEnd);
			while(this._genIndex < next) {
				const x = (this._genIndex % this._genWidth);
				const y = Math.floor(this._genIndex / this._genWidth);
				$generation.preGenerateFromRatio(x / this._genWidth, y / this._genWidth);
				this._genIndex++;
			}

			const r = (this._genIndex / this._genEnd);
			this.loadingText.text = Math.floor(100 * r).clamp(0, 99) + "%";
			const index = Math.floor(r * this._messages.length);
			this.messageText.text = r >= 0.99 ? "Getting stuck at 99%." : this._messages[index];
		} else if(this._endAnimation < 1) {
			this._endAnimation += 0.012;

			if(!this.jkText && this._endAnimation > 0.5) {
				this.jkText = PP.makeText("(Just kidding.)", 24);
				this.jkText.move(Graphics.width / 2, (Graphics.height / 2) + 80);
				this.addChild(this.jkText);

				this.loadingText.text = "100%";
			}

			if(!this.letsGo && this._endAnimation > 0.8) {
				this.letsGo = PP.makeText("Let's go!", 24);
				this.letsGo.move(Graphics.width / 2, (Graphics.height / 2) + 120);
				this.addChild(this.letsGo);
			}

			if(this._endAnimation >= 1) {
				this.commandNewGame();
			}

		} else if(this._endAnimation2 < 1) {
			if(this._endAnimation2 > 0) {
				const rr = (this._endAnimation2 - 0) / 1;
				const r = 1 - rr;

				this.loadingText.alpha = r;
				this.messageText.alpha = r;
				this.jkText.alpha = r;

				const rrr = rr < 0.3 ? (-60 * (rr / 0.3).quadOut()) : (-60 + (((rr - 0.3) / 0.7).cubicOut() * 180))
				this.letsGo.y = ((Graphics.height / 2) + 120) - rrr;
				if(rr >= 0.3) {
					this.letsGo.scale.set(1 + (2 * ((rr - 0.3) / 0.7).quadOut()));
				}
			}

			this._endAnimation2 += 0.04;
		} else if(!this._finished) {
			this._finishAni = 0;
			this._finished = true;
		} else if(this._finished) {
			this._finishAni += 0.03;
			if(this._finishAni > 1) this._finishAni = 1;

			this.letsGo.y = (Graphics.height / 2) + (this._finishAni.cubicIn() * 320);
			this.letsGo.scale.set(3 + (this._finishAni.cubicIn()));
		}

	}

	commandNewGame() {
		$generation.endGeneration();

		DataManager.setupNewGame();
		this.fadeOutAll();

		$gameVariables.setValue(1, this._worldSettings.name);
		$gameVariables.setValue(2, this._worldSettings.seed);
		$gameVariables.setValue(3, this._playerSettings.playerName);
		$gameVariables.setValue(4, this._playerSettings.playerClass);
		$gameVariables.setValue(5, this._worldSettings.playerStats);

		$ppPlayer.setAllStats(this._playerSettings.playerStats);

		$gameTemp._isNewGame = true;

		switch(this._playerSettings.playerClass) {
			case 0: {
				$ppPlayer.inventory.addActiveSkillFromName("Mind Boost");
				$ppPlayer.inventory.addActiveSkillFromName("Pairkinesis");
				break;
			}
			case 1: {
				$ppPlayer.inventory.addActiveSkillFromName("Pyrokinesis");
				$ppPlayer.inventory.addActiveSkillFromName("Heat Armor");
				break;
			}
			case 2: {
				$ppPlayer.inventory.addActiveSkillFromName("Chaoskinesis");
				$ppPlayer.inventory.addActiveSkillFromName("Biokinesis");
				break;
			}
		}

		SceneManager.goto(Scene_Map);
	}

	terminate() {
	}
}
