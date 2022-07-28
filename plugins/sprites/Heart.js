class Heart extends Sprite {
	constructor(icon, callback) {
		super();

		this.visible = false;
		this.scale.set(2);
		this.anchor.set(0.5);

		this.init(icon, callback);
	}

	init(icon, callback) {
		this.bitmap = ImageManager.lUi(icon ?? "Heart");
		this._callback = callback;

		this.setAnimationFrame(0);
		this._shouldBreak = false;
		this._animationCount = 0;
		this._animationFrame = 0;

		this.bitmap.addLoadListener(() => this.visible = true);
	}

	setAnimationFrame(i) {
		this.setFrame(i * 16, 0, 16, 16);
		this.alpha = 1 - ((i - 3) / 2).clamp(0, 1);
	}

	update() {
		if(this._shouldBreak) {
			if(this._animationFrame < 5) {
				this._animationCount++;
				if(this._animationCount > 1) {
					this._animationCount = 0;
					this._animationFrame++;
					this.setAnimationFrame(this._animationFrame);
					if(this._animationFrame === 5) {
						if(this._callback) this._callback(this);
					}
				}
			}
		}
	}

	break() {
		this._shouldBreak = true;
	}

	unbreak() {
		this._shouldBreak = false;
		this._animationCount = 0;
		this._animationFrame = 0;
		this.setAnimationFrame(0);
	}

	onPoolRemove() {
		if(this.parent) {
			this.parent.removeChild(this);
		}
		this.visible = false;
	}

	onPoolClear() {
		this.destroy();
	}
}