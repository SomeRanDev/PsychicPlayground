class MouseCursor extends Sprite {
	constructor() {
		super(ImageManager.loadPicture("MouseCursor"));

		this._time = 0;
		this.alpha = 0.34;

		this.targetX = 0;
		this.targetY = 0;
	}

	setPos(x, y) {
		if(this.targetX !== x || this.targetY !== y) {
			this.targetX = x;
			this.targetY = y;
			//this.reset();
		}
	}

	reset() {
		this._time = 0;
		this.setAnimationFrame(2);
	}

	update() {
		this.x = PP.lerp(this.x, this.targetX, 0.7);
		this.y = PP.lerp(this.y, this.targetY, 0.7);
	}

	setEnabled(e) {
		this.tint = e ? 0xffffff : 0xffffff;
		this.alpha = e ? 0.9 : 0.4;
	}

	/*update() {
		if(this._time < 1) {
			this._time++;
			this.setAnimationFrame(Math.floor(this._time / 1) + 1);
		}
	}*/
}