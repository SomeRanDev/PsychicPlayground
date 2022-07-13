
class DirectionalSprite extends Sprite {
	constructor(texture, frameCount) {
		super(texture);

		if(!frameCount) throw "No frame count provided in DirectionalSprite constructor!!";

		this._frameWidth = 0;
		this._frameHeight = 0;

		this._frameCount = frameCount;
		this._currentFrame = 0;
		this._directionIndex = 0;
		this._mirror = false;

		texture.smooth = false;
		texture.addLoadListener(this.onReady.bind(this));

		this.anchor.set(0.5, 1);
		this.scale.set(2);

		this.backAndForth = false;
	}

	onReady() {
		this._frameWidth = (this.bitmap.width / 5) / this._frameCount;
		this._frameHeight = this.bitmap.height;
		this.refresh();
	}

	refresh() {
		var frame = this._currentFrame;
		if(this.backAndForth && this._currentFrame >= this._frameCount) {
			frame = Math.abs(this._frameCount - this._currentFrame) + 1;
		}
		const index = (this._frameCount * this._directionIndex) + frame;
		this.setFrame(this._frameWidth * index, 0, this._frameWidth, this._frameHeight);
		this.scale.set(this._mirror ? -2 : 2, 2);
	}

	setAnimationFrame(frame) {
		if(frame >= 0 && frame < this.maxFrame()) {
			this._currentFrame = frame;
			this.refresh();
		}
	}

	maxFrame() {
		return this.backAndForth ? ((this._frameCount * 2) - 2) : this._frameCount;
	}

	incrementAnimation() {
		this._currentFrame++;
		if(this._currentFrame >= this.maxFrame()) {
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