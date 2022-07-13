class Scene_WorldSetup extends Scene_Base {
	constructor() {
		super();
	}

	initialize() {
		super.initialize();
	}

	create() {
		this.background = new TilingSprite(ImageManager.loadTitle1("Checker"));
		this.background.move(0, 0, Graphics.width / 2, Graphics.height);
		this.background.alpha = 0.25;
		this.addChild(this.background);

		this.background2 = new TilingSprite(ImageManager.loadTitle1("Checker"));
		this.background2.move(Graphics.width / 2, 0, Graphics.width / 2, Graphics.height);
		this.background2.alpha = 0.25;
		this.addChild(this.background2);

		this.shadow = new Sprite(ImageManager.loadTitle1("WorldSetupBackground"));
		this.shadow.scale.set(2);
		this.addChild(this.shadow);

		this.createWorldNameInput();
		this.createWorldSeedInput();
		this.createContinueButton();
	}

	start() {
		super.start();
		this.startFadeIn(this.fadeSpeed(), false);
	}

	createWorldNameInput() {
		this.nameInput = new TextInput("World Name", (Graphics.width / 2) - 50, 30, 30);
		this.nameInput.move(Graphics.width / 2, 80);
		this.addChild(this.nameInput);

		this.nameDesc = PP.makeText("The name of the world.\n(Helps identify when loading game).", 16);
		this.nameDesc.move(Graphics.width / 2, 130);
		this.addChild(this.nameDesc);
	}

	createWorldSeedInput() {
		this.seedInput = new TextInput("World Seed", (Graphics.width / 2) - 50, 30, 30);
		this.seedInput.move(Graphics.width / 2, 220);
		this.addChild(this.seedInput);

		this.seedDesc = PP.makeText("The randomness seed used to make the world.\nLeave blank to randomly generate one.", 16);
		this.seedDesc.move(Graphics.width / 2, 270);
		this.addChild(this.seedDesc);
	}

	createContinueButton() {
		this.button = new Button("Save World", 170, 30);
		this.button.move(Graphics.width / 2, Graphics.height - 60);
		this.addChild(this.button);
		this.button.onClick = () => {
			this.goToPlayerSetup();
		}
	}

	update() {
		super.update();

		this.background.origin.x += 0.6;
		this.background.origin.y += 0.6;

		this.background2.origin.x -= 0.6;
		this.background2.origin.y -= 0.6;
	}

	goToPlayerSetup() {
		this.fadeOutAll();
		SceneManager.goto(Scene_PlayerSetup);
		SceneManager.prepareNextScene({
			name: this.nameInput.getText() || "Unnamed",
			seed: this.seedInput.getText()
		});
	}

	terminate() {
	}
}
