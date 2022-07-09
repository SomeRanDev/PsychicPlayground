class DynamicBitmapShifter extends Sprite {
	constructor() {
		super(null);

		this.update = null;
		this._nextBitmap = null;

		this._animationRatio = 1;
		this._animationSpeed = 0.3;

		this._dontAnimateFromNull = true;
	}

	setBitmap(bitmap) {
		if(this._nextBitmap !== bitmap) {
			this._nextBitmap = bitmap;
			this.update = this.updateAnimation;
		}
	}

	hasBitmap() {
		return !!(this._nextBitmap);
	}

	updateAnimation() {
		if(this.bitmap !== this._nextBitmap) {
			if(this.bitmap === null) {
				this._changeToNextBitmap();
				if(this._dontAnimateFromNull) {
					this._endAnimation();
				} else {
					this._animationRatio = 0;
				}
			} else if(this._animationRatio > 0) {
				this._animationRatio -= this._animationSpeed;
				if(this._animationRatio <= 0) {
					this._animationRatio = 0;
					this._changeToNextBitmap();
				}
			}
		} else if(this._animationRatio < 1) {
			this._animationRatio += this._animationSpeed;
			if(this._animationRatio >= 1) {
				this._endAnimation();
			}
		}
		this.refreshAnimation();
	}

	_changeToNextBitmap() {
		this.bitmap = this._nextBitmap;
		this.visible = !!this.bitmap;
	}

	_endAnimation() {
		this._animationRatio = 1;
		this.update = null;
	}

	refreshAnimation() {
		this.scale.set((1 - (0.3 * (1 - this._animationRatio.cubicIn()))).clamp(0, 1));
	}
}