class PlayerStatMenu extends Sprite {
	constructor() {
		super();

		this.anchor.set(0.5);

		const args = [-60, -120, -200];

		this.statCountBackground = new Window_Base(new Rectangle(0, 0, 180, 40));
		this.statCountBackground.updateTone = function() {};
		this.statCountBackground.x = 15;
		this.statCountBackground.y = -30;
		this.statCountBackground.setTone(-160, -180, 240);
		this.addChild(this.statCountBackground);

		this.statDescBackground = new Window_Base(new Rectangle(0, 0, 300, 60));
		this.statDescBackground.updateTone = function() {};
		this.statDescBackground.x = -150;
		this.statDescBackground.y = 50;
		this.statDescBackground.setTone(-200, -200, -200);
		this.addChild(this.statDescBackground);

		this.levelBackground = new Window_Base(new Rectangle(0, 0, 180, 40));
		this.levelBackground.updateTone = function() {};
		this.levelBackground.x = -18 - 180;
		this.levelBackground.y = -30;
		this.levelBackground.setTone(-200, -60, -120);
		this.addChild(this.levelBackground);

		this.background = new Window_Base(new Rectangle(0, 0, 420, 60));
		this.background.updateTone = function() {};
		this.background.x = 420 / -2;
		this.background.setTone(-120, -120, -120);
		this.addChild(this.background);

		this.createStatInputs();

		this.statDescText = PP.makeText("", 16);
		this.statDescText.move(0, 100);
		this.statDescText.maxWidth = 120;
		this.addChild(this.statDescText);

		this.statCountText = PP.makeText("15 Remaining", 18);
		this.statCountText.anchor.set(0.5, 1);
		this.statCountText.move(105, -3);
		this.addChild(this.statCountText);
		this.updateStatCount();

		this.levelText = PP.makeText("Level 12", 18);
		this.levelText.anchor.set(0.5, 1);
		this.levelText.move(-110, -3);
		this.addChild(this.levelText);
	}

	createStatInputs() {
		this.statContainer = new PIXI.Container();
		this.statContainer.x = 0;
		this.statContainer.y = 0;
		this.addChild(this.statContainer);

		this.statInputs = [];

		const stats = Scene_PlayerSetup.getStatNames();
		const statDescs = Scene_PlayerSetup.getStatDescs();
		const len = stats.length;
		for(let i = 0; i < len; i++) {
			const input = new AccNumberInput(stats[i], 70, 25);
			input.move(-160 + (80 * i), 50);
			const statNum = $ppPlayer.getStatFromIndex(i);
			input.setNumber(statNum);
			input.onChange = this.updateStatCount.bind(this);
			input.onHover = (h) => {
				if(!h && this._statDesc === statDescs[i]) {
					this._statDesc = "";
				} else if(h && this._statDesc !== statDescs[i]) {
					this._statDesc = statDescs[i];
				}
			}
			this.statContainer.addChild(input);
			this.statInputs.push(input);
		}

		for(const inputs of this.statInputs) {
			inputs.setOthers(this.statInputs, 1, 999, 0);
		}
	}

	refreshStatInputs() {
		let totalMax = 0;
		const stats = Scene_PlayerSetup.getStatNames();
		const len = stats.length;
		for(let i = 0; i < len; i++) {
			const input = this.statInputs[i];
			const statNum = $ppPlayer.getStatFromIndex(i);
			input.setNumber(statNum);
			totalMax += statNum;
		}

		let index = 0;
		totalMax = $ppPlayer.statPoints;
		for(const inputs of this.statInputs) {
			const statNum = $ppPlayer.getStatFromIndex(index);
			inputs.setOthers(this.statInputs, statNum, statNum + $ppPlayer.statPoints, totalMax);
			inputs.updateText();
			index++;
		}

		this.updateLevelCount();
		this.updateStatCount();
	}

	applyStatInputs() {
		$ppPlayer.setAllStats(this.statInputs.map(s => s.getNumber()));
		$ppPlayer.statPoints = this.statInputs[0].pointsRemaining();
	}

	updateLevelCount() {
		this.levelText.text = "Level " + $ppPlayer.level;
	}

	updateStatCount() {
		this.statCountText.text = this.statInputs[0].pointsRemaining() + " Stat Points";
	}

	update() {
		this.statDescText.text = this._statDesc;
		this.statDescText.alpha = this.statDescText.alpha.moveTowardsCond(this._statDesc, 0, 1, 0.1);

		for(const i of this.statInputs) {
			i.update();
		}
	}
}