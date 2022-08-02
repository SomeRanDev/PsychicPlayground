class InteractableIndicator extends Sprite {
	constructor() {
		super(ImageManager.lUi("SpaceKey"));

		this.anchor.set(0.5, 1);

		this._text = PP.makeText("Space", 8);
		this._text.anchor.set(0.5, 1);
		this._text.x = 0;
		this._text.y = -9;
		this._text.resolution = 5;
		this.addChild(this._text);
	}
}

class Interactable {
	constructor(x, y, event, imgPath, frames, frameSpeed, eventsListOrCommonEventId) {
		this.x = x;
		this.y = y;
		this._event = event;
		this._imgPath = imgPath;
		this._frames = frames;
		this._aniSpeed = frameSpeed / 1000;

		if(typeof eventsListOrCommonEventId === "number") {
			this._commonEventId = eventsListOrCommonEventId;
		} else if(Array.isArray(eventsListOrCommonEventId)) {
			this._eventsList = eventsListOrCommonEventId;
			this._eventsList.splice(this._eventsList.length - 1, 0, {
				code: 355,
				indent: 0,
				parameters: ["$gameMap.endCurrentlyRunningEvent();"]
			});
		} else {
		}

		this._intKeyAni = 0;
		this._intTeleAni = 0;
		this._animation = 0;

		this._isTeleporting = false;

		this.active = true;

		SpriteManager.addEntity(this);
	}

	destroy() {
		SpriteManager.removeEntity(this);
	}

	addPosition(x, y) {
		this.x += x;
		this.y += y;
		if(this.sprite) {
			this.sprite.x = this.x * TS;
			this.sprite.y = this.y * TS;
		}
	}

	makeSprite() {
		this.sprite = new Sprite(ImageManager.lEntities(this._imgPath));
		this.sprite.anchor.set(0.5, 1);
		this.sprite.scale.set(2);

		this.sprite.x = this.x * TS;
		this.sprite.y = this.y * TS;

		this.sprite.visible = false;

		this.setAnimationFrame(0);

		this.key = new InteractableIndicator("Space", null, true);
		this.key.y = -20;
		this.key.alpha = 0;
		this.sprite.addChild(this.key);

		return this.sprite;
	}

	setAnimationFrame(f) {
		if(this.sprite && this.sprite.bitmap.isReady() && f >= 0 && f < this._frames) {
			if(!this._frameWidth) {
				this._frameWidth = this.sprite.bitmap.width / this._frames;
				this._frameHeight = this.sprite.bitmap.height;
			}
			this.sprite.setFrame(f * this._frameWidth, 0, this._frameWidth, this._frameHeight);
			this.sprite.visible = true;
		}
	}

	setAnimationFrameRatio(r) {
		this.setAnimationFrame(Math.floor(r * this._frames).clamp(0, this._frames - 1));
	}

	setNoAnimation() {
		this._noAnimation = true;
		this.setAnimationFrame(0);
	}

	update() {
		if(this.active) {
			this.updateAnimation();
			this.updateTeleport();
			this.updateIndicator();
			this.updateInput();
		}
	}

	updateAnimation() {
		if(!this._noAnimation || !this.sprite?.visible) {
			this._animation += this._aniSpeed;
			while(this._animation > 1) this._animation -= 1;
			this.setAnimationFrameRatio(this._animation);
		}
	}

	teleport() {
		this._isTeleporting = true;
		$gameTemp.forceWait = true;
	}

	teleportIn() {
		this._isTeleporting = true;
		this._reverseTeleport = true;
		this._intTeleAni = 1;
	}

	endTeleport() {
		$gameTemp.forceWait = false;
		this.sprite.visible = false;
		this.active = false;
	}

	endTeleportIn() {
		this._reverseTeleport = false;
		this._isTeleporting = false;
		this._intTeleAni = 0;
	}

	updateTeleport() {
		if(this._isTeleporting) {
			if(this._reverseTeleport) {
				this._intTeleAni -= 0.05;
				if(this._intTeleAni < 0) this._intTeleAni = 0;
			} else {
				this._intTeleAni += 0.05;
				if(this._intTeleAni > 1) this._intTeleAni = 1;
			}

			const r = this._intTeleAni;
			if(r < 0.5) {
				const a = (r / 0.5).cubicOut();
				this.sprite.scale.set((1 + (a * 0.5)) * 2, (1 - (a * 0.5)) * 2);
				this.sprite.setBlendColor([a * 255, a * 255, a * 255, a * 255]);
			} else {
				const b = (((r - 0.5) / 0.5));
				this.sprite.scale.set((1.5 - (b * 1.5)) * 2, (0.5 + (b * 1.5)) * 2);
				this.sprite.setBlendColor([255, 255, 255, 255]);
			}

			if(this._reverseTeleport) {
				if(this._intTeleAni <= 0) {
					this.endTeleportIn();
				}
			} else {
				if(this._intTeleAni >= 1) {
					this.endTeleport();
				}
			}
		}
	}

	updateIndicator() {
		this._isClose = this.isCloseToPlayer();
		const newKey = this._intKeyAni.moveTowardsCond(this._isClose && !this.currentExists(), 0, 1, 0.05);
		if(this._intKeyAni !== newKey) {
			this._intKeyAni = newKey;
			this.updateKey(newKey);
		}
	}

	updateKey(r) {
		this.key.y = (this._noAnimation ? 0 : -20) - (5 * r.cubicOut());
		this.key.alpha = r;
	}

	updateInput() {
		if(this._isClose && !this.currentExists() && (this._eventsList || this._commonEventId) && Input.isTriggeredEx("space")) {
			this.startEvent();
		}
	}

	isCloseToPlayer() {
		return Math.abs((this.x * TS) - $ppPlayer.position.x) < 60 &&
			Math.abs((this.y * TS) - $ppPlayer.position.y) < 50;
	}

	currentExists() {
		return !!$gameTemp.currentEvent;
	}

	isCurrent() {
		return $gameTemp.currentEvent === this;
	}

	startEvent() {
		$gameTemp.currentlyRunning = this;
		if(!this.noCameraMove) {
			$gameMap.CameraOffsetY = -60;
		}
		$gameTemp.currentEvent = this._event;
		this.runEvent();
	}

	runEvent() {
		if(this._commonEventId) {
			$gameTemp.reserveCommonEvent(this._commonEventId);
		} else {
			$gameMap._interpreter.setup(this._eventsList);
		}
	}

	endEvent() {
		$gameTemp.currentlyRunning = null;
		if(!this.noCameraMove) {
			$gameMap.CameraOffsetY = 0;
		}
		$gameTemp.currentEvent = null;
	}
}