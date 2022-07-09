
class PlayerSprite extends Sprite {
	constructor() {
		super();

		this._lastYTile = -999999;

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

		this._textPopper = new TextPopper(this, 0, -32);

		if(!ImageManager.IsTwitter) {
			this.makeHud();
		}
	}

	makeHud() {
		this._hotbar = new Hotbar();
		this._healthHud = new PlayerHealth();

		this._map = new Map(256, 256);
		this._map.setupCorner();

		this._mapKey = new Key("M", "Map");
		this._mapKey.move(Graphics.width - 80, 2);

		this._invKey = new Key("E", "Inventory");
		this._invKey.move(Graphics.width - 100, Graphics.height - 28);
	}

	refreshSpritePosition(startIndex = 0) {
		if(!this.parent) return;

		const parent = this.parent;
		const yThreshold = this.y;
		parent.removeChild(this);

		let added = false;
		const len = parent.children.length;
		for(let i = startIndex; i < len; i++) {
			const c = parent.children[i];
			if(c.z === 0 && c.y > yThreshold) {
				parent.addChildAt(this, i);
				added = true;
				break;
			}
		}
		if(!added) {
			parent.addChild(this);
		}
	}

	setDirection(dir) {
		if(this.direction !== dir) {
			this.direction = dir;
			if(this.currentAni) {
				this.currentAni.setDirection(dir);
			}
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

		if($ppPlayer.moving) {
			this.setWalk();
		} else {
			this.setIdle();
		}

		//this._textPopper.update();

		//this.scale.set(1, 1.0 + (Math.sin(PP.Time / 15) * 0.05));

		const tileY = Math.floor(this.y / 16);
		if(this._lastYTile !== tileY) {
			this._lastYTile = tileY;
			this.refreshSpritePosition();
		}
	}

	addText(text) {
		this._textPopper.addText(text);
	}
}