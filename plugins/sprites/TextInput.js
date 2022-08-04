class TextInputTextGetter {
	static textInputs = [];

	static addTextInput(input) {
		if(!this.keydownFunc) {
			this.keydownFunc = (e) => {
				if(!SceneManager._scene._active) return;
				for(const t of this.textInputs) {
					t.onKey(e);
				}
			}
		}

		this.textInputs.push(input);
		this._ensureHasEvent();
	}

	static removeTextInput(input) {
		this.textInputs.remove(input);
		this._checkRemoveEvent();
	}

	static _ensureHasEvent() {
		if(this.textInputs.length > 0) {
			document.addEventListener("keydown", this.keydownFunc);
		}
	}

	static _checkRemoveEvent() {
		if(this.textInputs.length <= 0) {
			document.removeEventListener("keydown", this.keydownFunc);
		}
	}
}

class TextInput extends Sprite {
	constructor(label, width, height, maxChars) {
		super();

		TextInputTextGetter.addTextInput(this);

		this._hitWidth = width;
		this._hitHeight = height;
		this._maxChars = maxChars ?? 10;

		this.anchor.set(0.5, 1);

		this.background = new Sprite(new Bitmap(width, height));
		this.background.anchor.set(0.5, 1);
		this.background.bitmap.fillAll("rgba(60, 60, 60, 1)");
		this.background.alpha = 0.5;
		this.addChild(this.background);

		this.backgroundUnderline = new Sprite(new Bitmap(width, 4));
		this.backgroundUnderline.anchor.set(0.5, 1);
		this.backgroundUnderline.bitmap.fillAll("rgba(60, 60, 60, 1)");
		this.backgroundUnderline.alpha = 0.8;
		this.addChild(this.backgroundUnderline);

		this.backgroundUnderlineColor = new Sprite(new Bitmap(width, 4));
		this.backgroundUnderlineColor.anchor.set(0.5, 1);
		this.backgroundUnderlineColor.bitmap.fillAll("rgba(80, 200, 140, 1)");
		this.backgroundUnderlineColor.alpha = 1;
		this.backgroundUnderlineColor.scale.set(0, 1);
		this.addChild(this.backgroundUnderlineColor);

		this.cursor = new Sprite(new Bitmap(4, height - 10));
		this.cursor.bitmap.fillAll("#ffffff");
		this.cursor.alpha = 0;
		this.cursor.scale.set(0);
		this.cursor.x = 2;
		this.cursor.y = (height / -2) - 1;
		this.cursor.anchor.set(0.5);
		this.addChild(this.cursor);

		this.text = PP.makeText("", height - 2);
		this.text.anchor.set(0);
		this.text.x = (width / -2) + 6;
		this.text.y = -height + 0;
		this.addChild(this.text);

		this.labelText = PP.makeText(label, height - 2);
		this.labelText.anchor.set(0);
		this.labelText.x = (width / -2) + 6;
		this.labelText.y = -height + 0;
		this.labelText.alpha = 0.7;
		this.addChild(this.labelText);

		this.refreshCursorPos();
		this.cursor.x = this._targetCursorX;

		this._hoverAni = 0;
		this._clickAni = 0;
		this._labelAni = 0;

		this._isHovered = false;
		this._isClicked = false;
	}

	validCode(c) {
		return (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || (c >= 48 && c <= 57) || c === 32;
	}

	validateText(t) {
		let result = "";
		for(let i = 0; i < t.length; i++) {
			const c = t.charCodeAt(i);
			if(this.validCode(c)) {
				result += t.charAt(i);
			}
		}
		return result;
	}

	onKey(e) {
		if(this._isClicked) {
			if(e.keyCode === 86 && e.ctrlKey) {
				if(Utils.isElectronjs()) {
					const { clipboard } = require("electron");
					const text = clipboard.readText();
					if(typeof text === "string") {
						this.text.text += this.validateText(text);
					}
				}
			} else if(e.keyCode === 8 && this.text.text.length > 0) {
				this.text.text = this.text.text.slice(0, -1)
			} else if(this.validCode(e.keyCode)) {
				this.text.text += e.shiftKey ? (e.key.toUpperCase()) : (e.key.toLowerCase());
			}
			
			if(this.text.text.length > this._maxChars) {
				this.text.text = this.text.text.substring(0, this._maxChars);
			}

			this.refreshCursorPos();
		}
	}

	refreshCursorPos() {
		this._targetCursorX = PIXI.TextMetrics.measureText(this.text.text, this.text.style).width - (this._hitWidth / 2) + 12;
	}

	destroy() {
		TextInputTextGetter.removeTextInput(this);

		if(this.background) {
			this.background.bitmap.destroy();
		}
		if(this.backgroundUnderline?.bitmap) {
			this.backgroundUnderline.bitmap.destroy();
		}
		if(this.backgroundUnderlineColor?.bitmap) {
			this.backgroundUnderlineColor.bitmap.destroy();
		}
		if(this.cursor?.bitmap) {
			this.cursor.bitmap.destroy();
		}

		super.destroy();
	}

	update() {
		const newHover = this._hoverAni.moveTowardsCond(this._isHovered, 0, 1, 0.1);
		if(this._hoverAni !== newHover) {
			this._hoverAni = newHover;

			this.background.alpha = 0.5 + (newHover * 0.3);
			this.backgroundUnderline = 0.8 + (newHover * 0.2);
		}

		const newClick = this._clickAni.moveTowardsCond(this._isClicked, 0, 1, 0.1);
		if(this._clickAni !== newClick) {
			this._clickAni = newClick;

			const r = this._isClicked ? newClick.cubicOut() : newClick.cubicIn();

			this.backgroundUnderlineColor.scale.set(r, 1);

			this.cursor.scale.set(r);
			this.cursor.alpha = newClick;
		}

		const newLabel = this._labelAni.moveTowardsCond(this._isClicked || this.text.text.length > 0, 0, 1, 0.1);
		if(this._labelAni !== newLabel) {
			this._labelAni = newLabel;

			const r = newLabel.cubicOut();
			this.labelText.alpha = 0.7 + (r * 0.3);
			this.labelText.y = -this._hitHeight - (r * 18);
			this.labelText.style.fontSize = (this._hitHeight - 2) - (8 * r);
		}

		if(this._isClicked) {
			this.cursor.alpha = 0.2 + ((Math.sin(Graphics.frameCount / 10) + 1) / 2) * 0.6;
			this.cursor.x = PP.lerp(this.cursor.x, this._targetCursorX, 0.4);
		}

		if(this._isHovered !== this.isBeingTouched()) {
			this._isHovered = this.isBeingTouched();
		}

		if(SceneManager._scene.isActive() && TouchInput.isTriggered()) {
			const wasClicked = this._isClicked;
			this._isClicked = this._isHovered;
			if(!wasClicked && this._isClicked) {
				playSe("Confirm", 50);
			}
		}
	}

	getText() {
		return this.text.text;
	}

	isBeingTouched() {
		if(!SceneManager._scene.isActive()) return false;
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
		return rect.contains(x, y);
	}
}