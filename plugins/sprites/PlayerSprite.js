
class PlayerSprite extends Sprite {
	constructor() {
		super();

		this._lastYTile = -999999;

		this.anchor.set(0.5, 1);

		this.idle = new DirectionalSprite(ImageManager.lPlayer("PlayerIdle"), 3);
		this.walk = new DirectionalSprite(ImageManager.lPlayer("PlayerWalk"), 3);
		this.sleep = new DirectionalSprite(ImageManager.lPlayer("PlayerSleep"), 2);

		this.idle.visible = true;
		this.walk.visible = false;
		this.sleep.visible = false;

		this.addChild(this.idle);
		this.addChild(this.walk);
		this.addChild(this.sleep);

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
		this._healthHud = new PlayerHealth();
		this._hotbar = new Hotbar();

		this._map = new Map(300, 300);
		this._map.setupCorner();
		this._map.visible = $ppPlayer.allowMapHud();

		this._mapKey = new Key("M", "Map");
		this._mapKey.move(Graphics.width - 80, 2);
		this._mapKey.visible = $ppPlayer.allowMapHud();

		this._invKey = new Key("E", "Inventory");
		this._invKey.move(Graphics.width - 100, Graphics.height - 28);

		/*
		this._coords = PP.makeText("0, 0", 18);
		this._coords.move(720, 120);
		SpriteManager.addUi(this._coords);
		*/
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

	setSleep() {
		if(this.setAnimation(this.sleep)) {
			this._timeCount = 0;
			this.currentAni.backAndForth = false;
			this.setFrameDelay(30);
		}		
	}

	setFrameDelay(delay) {
		this.frameDelay = delay;
	}

	update() {
		if($ppPlayer.canMove()) {
			this._timeCount++;
			if(this._timeCount >= this.frameDelay) {
				this._timeCount = 0;
				if(this.currentAni) {
					this.currentAni.incrementAnimation();
				}
			}

			if($ppPlayer.moving) {
				this.setWalk();
			} else {
				this.setIdle();
			}
		}

		this.x = $ppPlayer.position.x + $ppPlayer.spriteOffsetX;
		this.y = $ppPlayer.position.y + $ppPlayer.spriteOffsetY;

		if(this.currentAni === this.walk) {
			if(this.__lastCurrentFrame !== this.currentAni._currentFrame) {
				this.__lastCurrentFrame = this.currentAni._currentFrame;
				if(this.__lastCurrentFrame === 0 || this.__lastCurrentFrame === 2) {
					AudioManager.playSe({
						name: "Footstep2",
						volume: 10 + (Math.random() * 40),
						pitch: 75 + (Math.random() * 50),
						pan: 0
					});
				}
			}
		}

		//this._coords.text = Math.round($ppPlayer.position.x / TS) + ", " + Math.round($ppPlayer.position.y / TS);

		const tileY = Math.floor(this.y / 16);
		if(this._lastYTile !== tileY) {
			this._lastYTile = tileY;
			this.refreshSpritePosition();
		}
	}

	addText(text) {
		this._textPopper.addText(text);
	}

	addTextEx(text, color) {
		this._textPopper.addTextEx(text, color);
	}

	onHpChange() {
		this._healthHud.refreshHeartStatus();
	}

	onMaxHpChange() {
		this._healthHud.refreshHeartSprites();
	}

	onHungerChange() {
		this._healthHud.refreshHungerStatus();
	}

	onMaxHungerChange() {
		this._healthHud.refreshHungerSprites();
	}
}