class ChoiceInput extends Sprite {
	constructor(choices, label, width, height) {
		super();

		this._choices = choices;
		this._choiceIndex = 0;
		this._hitWidth = width;
		this._hitHeight = height;

		this.onChange = null;
		this.onHover = null;

		this.anchor.set(0.5, 1);

		this.background = new Sprite(new Bitmap(width, height));
		this.background.anchor.set(0.5, 1);
		this.background.bitmap.fillAll("rgba(60, 60, 60, 1)");
		this.background.alpha = 0.5;
		this.addChild(this.background);

		this.backgroundLeft = new Sprite(new Bitmap(width, height));
		this.backgroundLeft.anchor.set(0.5, 1);
		this.backgroundLeft.bitmap.gradientFillRect(0, 0, width, height, "rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0)", false);
		this.backgroundLeft.alpha = 0;
		this.addChild(this.backgroundLeft);

		this.backgroundRight = new Sprite(this.backgroundLeft.bitmap);
		this.backgroundRight.anchor.set(0.5, 1);
		this.backgroundRight.scale.set(-1, 1);
		this.backgroundRight.alpha = 0;
		this.addChild(this.backgroundRight);

		this.backgroundUnderline = new Sprite(new Bitmap(width, 4));
		this.backgroundUnderline.anchor.set(0.5, 1);
		this.backgroundUnderline.bitmap.fillAll("rgba(60, 60, 60, 1)");
		this.backgroundUnderline.alpha = 0.8;
		this.addChild(this.backgroundUnderline);

		this.arrowLeft = new Sprite(ImageManager.lUi("UIArrow"));
		this.arrowLeft.anchor.set(0.5);
		this.arrowLeft.move((width / -2) + 12, (height / -2) - 1);
		this.arrowLeft.scale.set(0);
		this.arrowLeft.alpha = 0.6;
		this.addChild(this.arrowLeft);

		this.arrowRight = new Sprite(this.arrowLeft.bitmap);
		this.arrowRight.anchor.set(0.5);
		this.arrowRight.move((width / 2) - 12, (height / -2) - 1);
		this.arrowRight.scale.set(0);
		this.arrowRight.alpha = 0.6;
		this.addChild(this.arrowRight);

		this.text = PP.makeText("", height - 2);
		this.text.anchor.set(0.5, 0);
		this.text.x = 0;
		this.text.y = -height + 0;
		this.addChild(this.text);

		this.labelText = PP.makeText(label, height - 10);
		this.labelText.anchor.set(0);
		this.labelText.x = (width / -2) + 6;
		this.labelText.y = -height - 18;
		this.labelText.alpha = 1;
		this.addChild(this.labelText);

		this._hoverAniLeft = 0;
		this._hoverAniRight = 0;

		this._shiftAni = 0;

		this._isHovered = false;
		this._isClicked = false;

		this.updateText();
	}

	update() {
		const dir = this.isBeingTouched();

		if(this.onHover) {
			if(this._lastDir !== dir) {
				this._lastDir = dir;
				this.onHover(dir !== 0);
			}
		}

		const newLeft = this._hoverAniLeft.moveTowardsCond(dir === -1 && this.canLeft(), 0, 1, 0.1);
		if(this._hoverAniLeft !== newLeft) {
			this._hoverAniLeft = newLeft;

			this.backgroundLeft.alpha = (newLeft * 0.25);
			this.arrowLeft.scale.set(newLeft);
		}


		const newRight = this._hoverAniRight.moveTowardsCond(dir === 1 && this.canRight(), 0, 1, 0.1);
		if(this._hoverAniRight !== newRight) {
			this._hoverAniRight = newRight;

			this.backgroundRight.alpha = (newRight * 0.25);
			this.arrowRight.scale.set(-newRight, newRight);
		}

		if(TouchInput.isTriggered() && ((dir === -1 && this.canLeft()) || (dir === 1 && this.canRight()))) {
			this.onChangeChoice(dir);
			if(this.onChange) this.onChange();

			if(this._shiftAni <= 1) {
				this._shiftAni = 2;
			}

			this._shiftDir = dir;
		}

		if(this._shiftAni > 0) {
			if(this._shiftAni > 1) {
				this._shiftAni -= 0.1;

				const r = this._shiftAni - 1;
				this.text.x = PP.lerpEx(0, this._shiftDir * -this._hitWidth, (1 - r).cubicIn());
				this.text.alpha = r * r * r;

				if(this._shiftDir === -1 && this._hoverAniLeft >= 1) {
					const s = 0.2 + (r < 0.5 ? (1 - (r / 0.5)) : (((r - 0.5) / 0.5))).cubicOut() * 0.8;
					this.arrowLeft.scale.set(s);
				} else if(this._shiftDir === 1 && this._hoverAniRight >= 1) {
					const s = 0.2 + (r < 0.5 ? (1 - (r / 0.5)) : (((r - 0.5) / 0.5))).cubicOut() * 0.8;
					this.arrowRight.scale.set(-s, s);
				}

				if(this._shiftAni <= 1) {
					this.text.alpha = 0;
					this.updateText();
				}
			} else {
				this._shiftAni -= 0.1;

				const r = (1 - this._shiftAni);
				this.text.x = PP.lerpEx(0, this._shiftDir * this._hitWidth, (1 - r).cubicIn());
				this.text.alpha = r * r * r;
			}
		}
	}

	getChoice() {
		return this._choiceIndex;
	}

	canLeft() {
		return true;
	}

	canRight() {
		return true;
	}

	onChangeChoice(dir) {
		this._choiceIndex += dir;
		if(this._choiceIndex < 0) this._choiceIndex = this._choices.length - 1;
		else if(this._choiceIndex >= this._choices.length) this._choiceIndex = 0;
	}

	updateText() {
		this.text.text = this._choices[this._choiceIndex];
	}

	isBeingTouched() {
		if(!SceneManager._scene.isActive()) return 0;
		const touchPos = new Point(TouchInput.x, TouchInput.y);
		const localPos = this.worldTransform.applyInverse(touchPos);
		return this.hitTest(localPos.x, localPos.y);
	}

	hitTest(x, y) {
		const rect = new Rectangle(
			-0.5 * this._hitWidth,
			(-1 * this._hitHeight),
			this._hitWidth,
			this._hitHeight
		);
		if(rect.contains(x, y)) {
			return (x < 0) ? -1 : 1;
		}
		return 0;
	}

	destroy() {
		if(this.background) {
			this.background.bitmap.destroy();
		}
		if(this.backgroundLeft) {
			this.backgroundLeft.bitmap.destroy();
		}
		if(this.backgroundUnderline) {
			this.backgroundUnderline.bitmap.destroy();
		}

		super.destroy();
	}
}