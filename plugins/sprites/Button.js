class Button extends Sprite {
	constructor(label, width, height) {
		super();

		this._hitWidth = width;
		this._hitHeight = height;

		this.anchor.set(0.5, 1);

		this.backgroundShadow = new Sprite(new Bitmap(width, height));
		this.backgroundShadow.anchor.set(0.5, 1);
		this.backgroundShadow.bitmap.fillAll("rgba(0, 0, 0, 1)");
		this.backgroundShadow.alpha = 0.5;
		this.backgroundShadow.move(2, 2);
		this.addChild(this.backgroundShadow);

		this.background = new Sprite(new Bitmap(width, height));
		this.background.anchor.set(0.5, 1);
		this.background.bitmap.fillAll("rgba(60, 60, 60, 1)");
		this.background.alpha = 0.75;
		this.addChild(this.background);

		this.text = PP.makeText(label, height - 2);
		this.text.anchor.set(0.5, 0);
		this.text.x = 0;
		this.text.y = -height + 0;
		this.background.addChild(this.text);

		this._hoverAni = 0;
		this._pressAni = 0;
	}

	update() {
		const isTouching = this.isBeingTouched();

		if(!this._isPressed) {
			const hoverAni = this._hoverAni.moveTowardsCond(isTouching, 0, 1, 0.2);
			if(this._hoverAni !== hoverAni) {
				this._hoverAni = hoverAni;

				this.background.x = -2 * hoverAni;
				this.background.y = -2 * hoverAni;
				this.background.alpha = 0.75 + (hoverAni * 0.25);
				this.backgroundShadow.alpha = 0.5 - (0.25 * hoverAni);
			}
		}

		if(SceneManager._scene.isActive()) {
			if(isTouching && TouchInput.isTriggered()) {
				this._isPressed = true;
			} else if(isTouching && TouchInput.isReleased()) {
				if(this.onClick) this.onClick();
			} 
		}
		if(!isTouching || !TouchInput.isPressed()) {
			this._isPressed = false;
		}

		this.text.tint = this._isPressed ? 0xaaaaaa : 0xffffff;

		const pressAni = this._pressAni.moveTowardsCond(this._isPressed, 0, 1, 0.2);
		if(this._pressAni !== pressAni) {
			this._pressAni = pressAni;

			this.background.x = -2 + (4 * pressAni);
			this.background.y = -2 + (4 * pressAni);
			this.background.alpha = 1;
			this.backgroundShadow.alpha = 0.25 + (0.75 * pressAni);
		}
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

	destroy() {
		if(this.background) {
			this.background.bitmap.destroy();
		}
		if(this.backgroundShadow) {
			this.backgroundShadow.bitmap.destroy();
		}

		super.destroy();
	}
}