
class PlayerSprite extends Sprite {
	constructor() {
		super();

		this.idle = new DirectionalSprite(ImageManager.lPlayer("PlayerIdle"), 3);
		this.walk = new DirectionalSprite(ImageManager.lPlayer("PlayerWalk"), 3);

		this.idle.visible = true;
		this.walk.visible = false;

		this.addChild(this.idle);
		this.addChild(this.walk);

		this.setDirection(2);
		this.setAnimation(this.idle);

		this._timeCount = 0;
	}

	setDirection(dir) {
		this.direction = dir;
		if(this.currentAni) {
			this.currentAni.setDirection(dir);
		}
	}

	setAnimation(ani) {
		if(this.currentAni !== ani) {
			if(this.currentAni) this.currentAni.visible = false;
			this.currentAni = ani;
			if(this.currentAni) {
				this.currentAni.visible = true;
				this.currentAni.setDirection(this.direction);
				this.currentAni.setAnimationFrame(0);
			}
		}
	}

	setIdle() {
		this.setAnimation(this.idle);
	}

	setWalk() {
		this.setAnimation(this.idle);
	}

	update() {
		this._timeCount++;
		if(this._timeCount >= 16) {
			this._timeCount = 0;
			if(this.currentAni) {
				this.currentAni.incrementAnimation();
			}
		}
	}
}