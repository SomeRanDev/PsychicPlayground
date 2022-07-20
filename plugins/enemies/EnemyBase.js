class EnemyBase {
	constructor(tileX, tileY) {
		this.tileX = tileX;
		this.tileY = tileY;

		this.x = tileX * TS;
		this.y = tileY * TS;

		this.direction = 0;
		this.speed = 0;

		this.time = 0;

		this.hp = this.getMaxHp();
		this.maxHp = this.hp;

		this._damageTime = 0;
		this._damageDirection = 0;
		this._damageKnockback = 4;

		this.colRect = { left: 6, right: 6, top: 0, bottom: 9 };

		this.idleAni = {
			front: "Blump_IdleFront",
			back: "Blump_IdleBack",
			frameCount: 12,
			speed: 12
		};

		this.walkAni = {
			front: "Blump_WalkFront",
			back: "Blump_WalkBack",
			frameCount: 2,
			speed: 6
		};

		this.damageAni = {
			front: "Blump_DamageFront",
			back: "Blump_DamageBack",
			frameCount: 1,
			speed: 999
		};

		this._teleportEffect = null;

		SpriteManager.addEntity(this);
		$gameTemp.enemies.push(this);
	}

	getMaxHp() {
		return 10;
	}

	destroy() {
		SpriteManager.removeEntity(this);
		$gameTemp.enemies.remove(this);
	}

	makeSprite() {
		this.sprite = new Sprite();
		this.setupSprite();
		return this.sprite;
	}

	setupSprite() {
		this.sprite.scale.set(2);
		this.sprite.anchor.set(0.5, 1);
	}

	update() {
		this.takingDamage = this._damageTime > 0;
		if(this.canMove()) {
			if(!this.takingDamage) {
				this.updateTime();
			}
			this.updateBehavior();
			this.updatePosition();
		}
		this.updateSprite();
		this.updateSpriteAnimation();
		this.updateTeleport();
	}

	canMove() {
		return !(
			$gameMap.isEventRunning() ||
			$gameMessage.isBusy() ||
			$gamePlayer.isTransferring() ||
			!!this._teleportEffect
		);
	}

	updateTime() {
		this.time++;
	}

	updateBehavior() {
	}

	updatePosition() {
		let isKnockback = false;

		if(this._damageTime > 0) {
			this._damageTime--;
			isKnockback = true;
			if(this._damageTime === 0) {
				this.onDamageKnockbackComplete();
			}
		}

		const speed = isKnockback ? this._damageKnockback : this.speed;

		if(speed !== 0) {
			const dir = isKnockback ? this._damageDirection : this.direction;
			
			let sx = this.x;
			let sy = this.y;
			const colRect = this.colRect;

			// * (Math.PI / 180);

			const inputX = -Math.sin(dir);
			if(inputX < 0) {
				sx -= colRect.left;
			} else if(inputX > 0) {
				sx += colRect.right;
			}
			if(inputX !== 0) {
				const newPosX = CollisionManager.processMovementX(sx, sy + colRect.bottom, (speed * inputX));
				const newPosX2 = CollisionManager.processMovementX(sx, sy - colRect.top, (speed * inputX));
				const finalX = inputX < 0 ? (Math.max(newPosX, newPosX2) + colRect.left) : (Math.min(newPosX, newPosX2) - colRect.left);
				this.x = Math.round(finalX);
			}

			sx = this.x;
			const inputY = -Math.cos(dir);
			if(inputY < 0) {
				sy -= colRect.top;
			} else if(inputY > 0) {
				sy += colRect.bottom;
			}
			if(inputY !== 0) {
				const newPosY = CollisionManager.processMovementY(sx - colRect.left, sy, (speed * inputY));
				const newPosY2 = CollisionManager.processMovementY(sx + colRect.right, sy, (speed * inputY));
				const finalY = inputY < 0 ? (Math.max(newPosY, newPosY2) + colRect.top) : (Math.min(newPosY, newPosY2) - colRect.bottom);
				this.y = Math.round(finalY);
			}
		}
	}

	updateSprite() {
		this.sprite.x = this.x;
		this.sprite.y = this.y;
	}

	updateSpriteAnimation() {
		if(this._frameWidth === -1) {
			if(this.sprite.bitmap.isReady()) {
				this._frameWidth = this.sprite.bitmap.width / this._frameCount;
				this._frameHeight = this.sprite.bitmap.height;
				this.refreshFrame();
			} else {
				return;
			}
		}

		this.updateAnimationFrame();

		// 0  -1
		//   . 
		// 1  -2
		const quad = Math.floor(this.direction / (Math.PI / 2));
		
		this.sprite.scale.set(quad >= 0 ? -2 : 2, 2);

		let animation = this.getAnimation();
		if(animation) {
			const img = (quad === 0 || quad === -1) ? animation.back : animation.front;
			this.sprite.bitmap = ImageManager.loadEnemy(img);

			this.setFrameCountAndRate(animation.frameCount, animation.speed);
			this.refreshFrame();
		} else {
			this.sprite.visible = false;
		}
	}

	updateAnimationFrame() {
		this._currentFrameTime++;
		if(this._currentFrameTime >= this._frameRate) {
			this._currentFrameTime = 0;
			this._currentFrame++;
			if(this._currentFrame >= this._frameCount) {
				this._currentFrame = 0;
			}
			this.refreshFrame();
		}
	}

	getAnimation() {
		if(this._damageTime > 0) {
			return this.damageAni;
		}
		return this.speed < 1 ? this.idleAni : this.walkAni;
	}

	setFrameCountAndRate(count, rate) {
		if(this._frameCount !== count || this._frameRate !== rate) {
			this._frameCount = count;
			this._frameRate = rate;
			this._currentFrame = 0;
			this._currentFrameTime = 0;
			if(this.sprite.bitmap.isReady()) {
				this._frameWidth = this.sprite.bitmap.width / this._frameCount;
				this._frameHeight = this.sprite.bitmap.height;
			} else {
				this._frameWidth = -1;
			}
			this.refreshFrame();
		}
	}

	refreshFrame() {
		if(this._frameWidth !== -1) {
			this.sprite.setFrame(this._currentFrame * this._frameWidth, 0, this._frameWidth, this._frameHeight);
		}
	}

	updateTeleport() {
		if(this._teleportEffect) {
			if(this._teleportEffect.update()) {
				this._teleportEffect = null;
			}
		}
	}

	teleportIn() {
		this._teleportEffect = new EnemyTeleport_Effect(this.sprite);
		this._teleportEffect.teleportIn();
	}

	setDirectionToPlayer() {
		this.direction = Math.atan2(this.x - $ppPlayer.position.x, this.y - $ppPlayer.position.y);
	}

	takeDamage(amount, direction, knockbackTime = 8, knockbackSpeed = 4) {
		this.hp -= amount;
		if(this.hp <= 0) {
			this.hp = 0;
			this.onKill();
		} else {
			this._damageTime = knockbackTime;
			this._damageDirection = direction;
			this._damageKnockback = knockbackSpeed;
		}
	}

	onDamage() {
	}

	onDamageKnockbackComplete() {
	}

	onKill() {
	}
}

class EnemyTeleport_Effect {
	constructor(sprite) {
		this.sprite = sprite;

		this._isTeleporting = false;
		this._reverseTeleport = false;
		this._intTeleAni = 0;
	}

	teleport() {
		this._isTeleporting = true;
	}

	teleportIn() {
		this._isTeleporting = true;
		this._reverseTeleport = true;
		this._intTeleAni = 1;
	}

	endTeleport() {
		this.sprite.visible = false;
	}

	endTeleportIn() {
		this._reverseTeleport = false;
		this._isTeleporting = false;
		this._intTeleAni = 0;

		this.sprite.scale.set(2);
		this.sprite.setBlendColor([0, 0, 0, 0]);
	}

	update() {
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

			return false;
		}
		return true;
	}
}
