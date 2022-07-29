class EnemyBase {
	constructor(tileX, tileY, onDefeat = null) {
		this.tileX = tileX;
		this.tileY = tileY;

		this.onDefeat = onDefeat;

		this.x = tileX * TS;
		this.y = tileY * TS;

		this.direction = Math.PI * 0;
		this.speed = 0;

		this.time = 0;

		this.hp = this.getMaxHp();
		this.maxHp = this.hp;

		this._damageTime = 0;
		this._damageDirection = 0;
		this._damageKnockback = 4;

		this._enemyHpBarAppear = 0;

		this._projectiles = [];

		this.setupCollisionRect();

		this.setupAnimations();

		this._effect = null;

		SpriteManager.addEntity(this);
		$gameTemp.enemies.push(this);
	}

	setupCollisionRect() {
		this.colRect = { left: 6, right: 6, top: 0, bottom: 9 };
	}

	setupAnimations() {
		this.idleAni = this.buildAnimation("Blump_IdleFront", "Blump_IdleBack", 12, 12);
		this.walkAni = this.buildAnimation("Blump_WalkFront", "Blump_WalkBack", 2, 5);
		this.damageAni = this.buildAnimation("Blump_DamageFront", "Blump_DamageBack", 1, 999);
	}

	buildAnimation(front, back, frameCount, speed) {
		return { front, back, frameCount, speed };
	}

	getMaxHp() {
		return 10;
	}

	exp() {
		return 10;
	}

	destroy() {
		SpriteManager.removeEntity(this);
		$gameTemp.enemies.remove(this);
	}

	makeSprite() {
		this.sprite = new Sprite();
		this.setupSprite();

		this.hpBar = new EnemyHpBar();
		this.hpBar.move(0, -20);
		this.sprite.addChild(this.hpBar);

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
			this.updateProjectiles();
			this.updatePlayerTouch();
		}
		this.updateSprite();
		this.updateSpriteAnimation();
		this.updateHpBar();
		this.updateTeleport();

		this.hpBar.scale.set(this.sprite.scale.x > 0 ? -1 : 1, 1);
	}

	canMove() {
		return !(
			$gameMap.isEventRunning() ||
			$gameMessage.isBusy() ||
			$gamePlayer.isTransferring() ||
			(this._effect?.disallowMovement ?? false)
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

			CollisionManager.setPlayerCollisionCheck();

			const inputX = Math.cos(dir);
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
			const inputY = Math.sin(dir);
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

		// -2  -1
		//    . 
		//  1   0
		const quad = Math.floor(this.direction / (Math.PI / 2));
		
		const reverse = (quad === -2 || quad === 1);
		this.sprite.scale.set(reverse ? -2 : 2, 2);

		let animation = this.getAnimation();
		if(animation) {
			const img = (quad === -2 || quad === -1) ? animation.back : animation.front;
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

	updateHpBar() {
		const newAlpha = this.hpBar.alpha.moveTowardsCond(this._enemyHpBarAppear > 0, 0, 1, 0.1);
		if(this.hpBar.alpha !== newAlpha) {
			this.hpBar.alpha = newAlpha;
		}

		this.hpBar.setRatio(this.hp / this.maxHp);

		if(this._enemyHpBarAppear > 0) this._enemyHpBarAppear--;
	}

	updateTeleport() {
		if(this._effect) {
			if(this._effect.update()) {
				this._effect = null;
			}
		}
	}

	teleportIn() {
		this._effect = new EnemyTeleport_Effect(this.sprite);
		this._effect.teleportIn();
	}

	damageEffect(doTone = true) {
		if(this._effect) {
			this._effect.sprite = null;
			this._effect = null;
		}
		this._effect = new EnemyDamage_Effect(this.sprite, doTone);
	}

	deathEffect() {
		if(this._effect) {
			this._effect.sprite = null;
			this._effect = null;
		}
		this._effect = new EnemyDeath_Effect(this, this.sprite);
	}

	setDirectionToPlayer() {
		this.direction = Math.atan2($ppPlayer.position.y - this.y, $ppPlayer.position.x - this.x);
	}

	takeDamage(amount, direction, knockbackTime = 8, knockbackSpeed = 4) {
		if(this.hp > 0) {
			this.hp -= amount;
			if(this.hp <= 0) {
				this.hp = 0;
				this._enemyHpBarAppear = 0;
				this.onKill();
				this.deathEffect();
			} else {
				this._damageTime = knockbackTime;
				this._damageDirection = direction;
				this._damageKnockback = knockbackSpeed;
				this._enemyHpBarAppear = 300;
				this.damageEffect(amount !== 0);
			}
		}
	}

	onDamage() {
	}

	onDamageKnockbackComplete() {
	}

	onKill() {
		$ppPlayer.addExp(this.exp());
	}

	onDeathEffectDone() {
		this.destroy();
		if(this.onDefeat) {
			this.onDefeat();
		}
	}

	checkProjectile(projectile, x, y) {
		const x1 = this.x - this.colRect.left;
		const x2 = this.x + this.colRect.right;
		const y1 = this.y - this.colRect.top;
		const y2 = this.y + this.colRect.bottom;
		const r = projectile.radius;

		const xn = Math.max(x1, Math.min(x, x2));
		const yn = Math.max(y1, Math.min(y, y2));
		const dx = xn - x;
		const dy = yn - y;

		if((dx * dx + dy * dy) <= r * r) {
			if(projectile.onEnemyHit) {
				projectile.onEnemyHit(this);
			}
			return true;
		}
		return false;
	}

	shootProjectile(dir, img = "Attack", x = 0, y = 0) {
		const p = EnemyProjectileObjectPool.getObject(this.x + x, this.y + y, dir, img);
		this._projectiles.push(p);
		p.onPlayerHit = (player) => {
			player.takeDamage(p.damage, p.direction);
		};
		return p;
	}

	updateProjectiles() {
		let len = this._projectiles.length;
		for(let i = 0; i < len; i++) {
			if(this._projectiles[i].update()) {
				const p = this._projectiles[i];
				this._projectiles.splice(i, 1);
				EnemyProjectileObjectPool.removeObject(p);
				i--;
				len--;
			}
		}
	}

	updatePlayerTouch() {
		if($ppPlayer.isInvincible()) {
			return;
		}

		const col1 = this.collisionBox();
		const col2 = $ppPlayer.collisionBox();
		if(col1.left < col2.right &&
			col1.right > col2.left &&
			col1.top < col2.bottom &&
			col1.bottom > col2.top) {

			const dir = Math.atan2($ppPlayer.position.y - this.y, $ppPlayer.position.x - this.x);
			$ppPlayer.takeDamage(this.bodyDamage(), dir);
		}
	}

	bodyDamage() {
		return 10;
	}

	collisionBox() {
		return {
			left: this.x - this.colRect.left,
			right: this.x + this.colRect.right,
			top: this.y - this.colRect.top,
			bottom: this.y + this.colRect.bottom
		};
	}
}

class EnemyTeleport_Effect {
	constructor(sprite) {
		this.sprite = sprite;

		this.disallowMovement = true;

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

class EnemyDamage_Effect {
	constructor(sprite, doTone) {
		this.sprite = sprite;
		this.doTone = doTone;

		this.disallowMovement = false;

		this._time = 0;
	}

	update() {
		this._time += 0.05;

		const r = this._time;
		if(r < 0.5) {
			const a = (r / 0.5).cubicOut();
			this.sprite.scale.set((1 - (a * 0.3)) * 2, (1 + (a * 0.3)) * 2);
			if(this.doTone) this.sprite.setBlendColor([a * 255, a * 125, a * 125, a * 255]);
		} else {
			const b = (((r - 0.5) / 0.5));
			this.sprite.scale.set((0.7 + (b * 0.3)) * 2, (1.3 - (b * 0.3)) * 2);

			const c = 1 - b;
			if(this.doTone) this.sprite.setBlendColor([c * 255, c * 125, c * 125, c * 255]);
		}

		if(this._time >= 1) {
			this.sprite.scale.set(2);
			if(this.doTone) this.sprite.setBlendColor([0, 0, 0, 0]);
			return true;
		}

		return false;
	}
}

class EnemyDeath_Effect {
	constructor(enemy, sprite) {
		this.enemy = enemy;
		this.sprite = sprite;

		this.disallowMovement = true;

		this._time = 0;
	}

	update() {
		this._time += 0.05;
		if(this._time > 1) this._time = 1;

		const r = this._time;
		if(r < 0.5) {
			const a = (r / 0.5).cubicOut();
			this.sprite.scale.set((1 + (a * 0.5)) * 2, (1 - (a * 0.5)) * 2);
			this.sprite.setBlendColor([a * 255, a * 255, a * 255, a * 255]);
		} else {
			const b = (((r - 0.5) / 0.5));
			this.sprite.scale.set((1.5 - (b * 1.5)) * 2, (0.5 + (b * 1.5)) * 2);
			this.sprite.setBlendColor([255, 125, 125, 255]);
		}

		if(this._time >= 1) {
			this.sprite.setBlendColor([255, 125, 125, 255]);
			this.sprite.scale.set(0, 4);
			this.enemy.onDeathEffectDone();
			return true;
		}

		return false;
	}
}
