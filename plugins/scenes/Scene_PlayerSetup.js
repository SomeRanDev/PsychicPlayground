class Scene_PlayerSetup extends Scene_Base {
	constructor(worldSettings) {
		super();
	}

	prepare(worldSettings) {
		this._worldSettings = worldSettings;
	}

	initialize() {
		super.initialize();

		this._statDesc = "";
		this._buttonPos = 1;
	}

	create() {
		this.createNameInput();
		this.createClassInput();
		this.createStatInputs();
		this.createContinueButton();

		this.classText = PP.makeText("", 16);
		this.classText.anchor.set(0);
		this.classText.style.align = "left";
		this.classText.move((Graphics.width / 2) + 30, 100);
		this.addChild(this.classText);
		this.onClassChange();

		this.statDescText = PP.makeText("", 18);
		this.statDescText.move(210, 430);
		this.statDescText.maxWidth = 120;
		this.addChild(this.statDescText);

		this.statCountText = PP.makeText("15 Remaining", 18);
		this.statCountText.anchor.set(0.5, 1);
		this.statCountText.move(210, 380);
		this.addChild(this.statCountText);
		this.updateStatCount();

		this.platform = new Sprite(ImageManager.loadTitle1("PlayerSetupPlatform"));
		this.platform.scale.set(2);
		this.platform.anchor.set(0.5);
		this.platform.move(195, 180);
		this.platform.alpha = 0.75;
		this.addChild(this.platform);

		this.playerHolder = new Sprite();
		this.playerHolder.scale.set(1.5);
		this.playerHolder.move(195, 180);
		this.playerHolder.anchor.set(0.5, 1);
		this.addChild(this.playerHolder);

		this.player = new DirectionalSprite(ImageManager.lPlayer("PlayerWalk"), 3);
		this.player.backAndForth = true;
		this.playerHolder.addChild(this.player);
		this._playerFrame = 0;
		this._playerDir = 2;
		this._playerDirList = [2, 3, 6, 9, 8, 7, 4, 1];
	}

	start() {
		super.start();
		this.startFadeIn(this.fadeSpeed(), false);
	}

	createNameInput() {
		this.nameInput = new TextInput("Player Name", (Graphics.width / 2) - 50, 30, 30);
		this.nameInput.move(Graphics.width / 4, 80);
		this.addChild(this.nameInput);
	}

	createClassInput() {
		this.classInput = new ChoiceInput(["Telekinetic", "Pyrokinetic", "Randokinetic"], "Class", (Graphics.width / 2) - 50, 30);
		this.classInput.move(Graphics.width * 0.75, 80);
		this.classInput.onChange = this.onClassChange.bind(this);
		this.addChild(this.classInput);
	}

	static getStatNames() {
		return ["Power", "Speed", "Aiming", "Breaking", "Making"];
	}

	static getStatDescs() {
		return [
			"Increases damage done by abilities\nand materials",
			"Increases movement speed and\nshoot frequency.",
			"Increases shoot accuracy and\nreduces cooldown times.",
			"Increases speed at which structures\ncan be mined.",
			"Decreases material cost of\nbuilding structures."
		];
	}

	createStatInputs() {
		this.statInputs = [];
		const stats = Scene_PlayerSetup.getStatNames();
		const statDescs = Scene_PlayerSetup.getStatDescs();
		const len = stats.length;
		for(let i = 0; i < len; i++) {
			const input = new AccNumberInput(stats[i], 100, 30);
			if(i < 3) {
				input.move(80 + (120 * i), 300);
			} else {
				input.move(80 + (i === 3 ? 0.5 : 1.5) * 120, 350);
			}
			input.setNumber(3);
			input.onChange = this.updateStatCount.bind(this);
			input.onHover = (h) => {
				if(!h && this._statDesc === statDescs[i]) {
					this._statDesc = "";
				} else if(h && this._statDesc !== statDescs[i]) {
					this._statDesc = statDescs[i];
				}
			}
			this.addChild(input);
			this.statInputs.push(input);
		}
		for(const inputs of this.statInputs) {
			inputs.setOthers(this.statInputs, 1, 8, 15);
		}
	}

	createContinueButton() {
		this.button = new Button("Save Character and Begin!", 320, 30);
		this.button.move(Graphics.width * 0.75, Graphics.height + 30);
		this.addChild(this.button);
		this.button.onClick = () => {
			this.goToWorldLoad();
		}
	}

	goToWorldSetup() {
		this.fadeOutAll();
		SceneManager.goto(Scene_WorldSetup);
	}

	goToWorldLoad() {
		$generation = new GenerationManager(this._worldSettings.seed);
		this.fadeOutAll();
		SceneManager.goto(Scene_WorldLoad);
		SceneManager.prepareNextScene(this._worldSettings, {
			playerName: this.nameInput.getText(),
			playerClass: this.classInput.getChoice(),
			playerStats: this.statInputs.map(si => si.getNumber())
		});
	}

	updateStatCount() {
		this.statCountText.text = this.statInputs[0].pointsRemaining() + " Remaining";
	}

	onClassChange() {
		const descs = [
`Mastery of the manipulation of kinetic energy.
While most psychics can manipulate matter,
Telekinetics specialize in launching,
moving, and other core motion abilities.

(Excellent choice for beginners)

+Mind Boost Ability
+Pairkinesis Ability`,

`Focused on the control of thermal energy.
The majority of psychics require materials
to fling at their enemies; however, Pyros
can conjure combative flames from nothing.

(You can also mine charcoal from trees)

+Pyrokinesis Ability
+Overheat Armor Ability`,

`Trades control for greater powers.
The randomness of their powers is the cost
incurred for using forbiden techniques.
Who knows how things will turn out...

(Normal abilties still work the same)

+Chaoskinesis Ability
+Biokinesis Ability`
		];

		this.classText.text = descs[this.classInput.getChoice()];
	}

	update() {
		super.update();

		this.statDescText.text = this._statDesc;
		this.statDescText.alpha = this.statDescText.alpha.moveTowardsCond(this._statDesc, 0, 1, 0.1);

		this._playerDir += 0.02;
		if(this._playerDir >= this._playerDirList.length) this._playerDir = 0;
		this.player.setDirection(this._playerDirList[Math.floor(this._playerDir)]);

		this._playerFrame += 0.09;
		if(this._playerFrame >= 4) this._playerFrame = 0;
		this.player.setAnimationFrame(Math.floor(this._playerFrame));

		const newButtonPos = this._buttonPos.moveTowardsCond(!this.nameInput.getText(), 0, 1, 0.1);
		if(this._buttonPos !== newButtonPos) {
			this._buttonPos = newButtonPos;

			this.button.y = PP.lerpEx(Graphics.height - 30, Graphics.height + 30, this._buttonPos);
		}
	}

	terminate() {
	}
}
