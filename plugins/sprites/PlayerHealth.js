class PlayerHealth extends Sprite {
	constructor() {
		super();

		this._hearts = [];
		this.makeHealthText();
		this.refreshHearts();

		this._hunger = [];
		this.makeHungerText();
		this.refreshHunger();

		this.makeExpContainer();
		this.makeExpText();

		this.move(0, 0);

		SpriteManager.addUi(this);
	}

	makeHeart(index) {
		const offsetX = 72;
		const offsetY = 22;

		const back = new Sprite(ImageManager.lUi("HeartBackground"));
		back.scale.set(2);
		back.anchor.set(0.5);
		back.move((index * 18) + offsetX, offsetY);
		this.addChild(back);

		const heart = HeartObjectPool.getObject("Heart");
		heart.move((index * 18) + offsetX, offsetY);
		this._hearts.push(index);
		this.addChild(heart);
	}

	makeHunger(index) {
		const offsetX = 72;
		const offsetY = 54;

		const back = new Sprite(ImageManager.lUi("HungerBackground"));
		back.scale.set(2);
		back.anchor.set(0.5);
		back.move((index * 18) + offsetX, offsetY);
		this.addChild(back);

		const hunger = HeartObjectPool.getObject("Hunger");
		hunger.move((index * 18) + offsetX, offsetY);
		this._hunger.push(index);
		this.addChild(hunger);
	}

	makeText(textString, align = "left") {
		const text = PP.makeText(textString, 18, align);
		text.style.fill = 0xffffff;
		text.style.strokeThickness = 4;
		text.style.stroke = "rgba(55, 40, 64, 1)";
		text.scale.set(1, 1);
		text.alpha = 1;
		text.resolution = 5;
		return text;
	}

	makeHealthText() {
		this._healthText = this.makeText("Health");
		this._healthText.x = 90;
		this._healthText.y = 21;
		this.addChild(this._healthText);
	}

	makeHungerText() {
		this._hungerText = this.makeText("Hunger");
		this._hungerText.x = 90;
		this._hungerText.y = 51;
		this.addChild(this._hungerText);
	}

	makeExpContainer() {
		this._exp = new Sprite(ImageManager.lUi("EXPContainer"));
		this._exp.scale.set(2);
		this._exp.move(1, 1);
		this.addChild(this._exp);
	}

	makeExpText() {
		this._expText = this.makeText("EXP", "center");
		this._expText.x = 33;
		this._expText.y = 76;
		this.addChild(this._expText);
	}

	heartCount() {
		return 8;
	}

	refreshHearts() {
		for(let i = this._hearts.length; i < this.heartCount(); i++) {
			this.makeHeart(i);
		}
	}

	hungerCount() {
		return 8;
	}

	refreshHunger() {
		for(let i = this._hunger.length; i < this.hungerCount(); i++) {
			this.makeHunger(i);
		}
	}
}