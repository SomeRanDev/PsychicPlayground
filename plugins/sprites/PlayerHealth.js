class PlayerHealth extends Sprite {
	constructor() {
		super();

		this._hearts = [];
		this.makeHealthText();
		this.refreshHeartSprites();
		this.refreshHeartStatus();

		this._hunger = [];
		this.makeHungerText();
		this.refreshHungerSprites();
		this.refreshHungerStatus();

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
		this._hearts.push(heart);
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
		this._hunger.push(hunger);
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

		this._expValue = new TilingSprite(ImageManager.lUi("EXP"));
		this._expValue.move(9, 5);
		this._exp.addChild(this._expValue);
		this._expRatio = 0;
		this.refreshExp();
	}

	refreshExp() {
		this._targetExpRatio = $ppPlayer.expRatio();
		this.refreshExpGauge();
	}

	refreshExpGauge() {
		const bw = this._expValue.bitmap.width;
		const bh = this._expValue.bitmap.height;
		const h = Math.round(bh * this._expRatio);
		this._expValue.move(9, 5 + (bh - h), bw, h);
	}

	update() {
		super.update();

		if(this._expRatio !== 0 || this._targetExpRatio !== 0) {
			if(this._expRatio !== this._targetExpRatio) {
				this._expRatio = PP.lerp(this._expRatio, this._targetExpRatio, 0.1);
				this.refreshExpGauge();
			}
			this._expValue.origin.y += 0.2;
		}
	}

	makeExpText() {
		this._expText = this.makeText("EXP", "center");
		this._expText.x = 33;
		this._expText.y = 76;
		this.addChild(this._expText);
	}

	heartCount() {
		return Math.floor($ppPlayer.maxHp / 10);
	}

	refreshHeartSprites() {
		for(let i = this._hearts.length; i < this.heartCount(); i++) {
			this.makeHeart(i);
		}
	}

	refreshHeartStatus() {
		const hp = Math.floor($ppPlayer.hp / 10);
		const maxHp = this.heartCount();
		for(let i = 1; i <= maxHp; i++) {
			const h = this._hearts[i - 1];
			if(i <= hp) {
				h.unbreak();
			} else {
				h.break();
			}
		}
	}

	hungerCount() {
		return Math.floor($ppPlayer.maxHunger / 10);
	}

	refreshHungerSprites() {
		for(let i = this._hunger.length; i < this.hungerCount(); i++) {
			this.makeHunger(i);
		}
	}

	refreshHungerStatus() {
		const hunger = Math.floor($ppPlayer.hunger / 10);
		const maxHunger = this.hungerCount();
		for(let i = 1; i <= maxHunger; i++) {
			const h = this._hunger[i - 1];
			if(i <= hunger) {
				h.unbreak();
			} else {
				h.break();
			}
		}
	}
}