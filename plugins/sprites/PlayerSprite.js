
class PlayerSprite extends Sprite {
	constructor() {
		super();

		this.anchor.set(0.5, 1);

		this.idle = new DirectionalSprite(ImageManager.lPlayer("PlayerIdle"), 3);
		this.walk = new DirectionalSprite(ImageManager.lPlayer("PlayerWalk"), 3);

		this.idle.visible = true;
		this.walk.visible = false;

		this.addChild(this.idle);
		this.addChild(this.walk);

		this.setDirection(2);
		this.setAnimation(this.idle);

		this._timeCount = 0;

		this.frameDelay = 16;
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
			return true;
		}
		return false;
	}

	setIdle() {
		if(this.setAnimation(this.idle)) {
			this._timeCount = 0;
			this.currentAni.backAndForth = false;
			this.setFrameDelay(16);
		}
	}

	setWalk() {
		if(this.setAnimation(this.walk)) {
			this._timeCount = 0;
			this.currentAni.backAndForth = true;
			this.setFrameDelay(8);
		}		
	}

	setFrameDelay(delay) {
		this.frameDelay = delay;
	}

	update() {
		this._timeCount++;
		if(this._timeCount >= this.frameDelay) {
			this._timeCount = 0;
			if(this.currentAni) {
				this.currentAni.incrementAnimation();
			}
		}

		this.x = $ppPlayer.position.x;
		this.y = $ppPlayer.position.y;

		//this.scale.set(1, 1.0 + (Math.sin(PP.Time / 15) * 0.05));
	}
}