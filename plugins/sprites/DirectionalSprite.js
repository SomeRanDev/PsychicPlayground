
class DirectionalSprite extends Sprite {
	constructor(texture, frameCount) {
		super(texture);

		this._frameWidth = 0;
		this._frameHeight = 0;

		this._frameCount = frameCount;
		this._currentFrame = 0;
		this._directionIndex = 0;
		this._mirror = false;

		texture.smooth = false;
		texture.addLoadListener(this.onReady.bind(this));

		this.scale.set(2);
	}

	onReady() {
		this._frameWidth = (this.bitmap.width / 5) / this._frameCount;
		this._frameHeight = this.bitmap.height;
		this.refresh();
	}

	refresh() {
		const index = (this._frameCount * this._directionIndex) + this._currentFrame;
		this.setFrame(this._frameWidth * index, 0, this._frameWidth, this._frameHeight);
	}

	setAnimationFrame(frame) {
		if(frame >= 0 && frame < this._frameCount) {
			this._currentFrame = frame;
			this.refresh();
		}
	}

	incrementAnimation() {
		this._currentFrame++;
		if(this._currentFrame >= this._frameCount) {
			this._currentFrame = 0;
		}
		this.refresh();
	}

	setDirection(dir) {
		this._directionIndex = 0;
		this._mirror = false;
		switch(dir) {
			case 2: {
				this._directionIndex = 0;
				break;
			}
			case 3: {
				this._directionIndex = 1;
				break;
			}
			case 6: {
				this._directionIndex = 2;
				break;
			}
			case 9: {
				this._directionIndex = 3;
				break;
			}
			case 8: {
				this._directionIndex = 4;
				break;
			}
			case 7: {
				this._directionIndex = 3;
				this._mirror = true;
				break;
			}
			case 4: {
				this._directionIndex = 2;
				this._mirror = true;
				break;
			}
			case 1: {
				this._directionIndex = 1;
				this._mirror = true;
				break;
			}
		}

		this.refresh();
	}
}