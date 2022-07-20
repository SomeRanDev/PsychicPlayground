class EnemyProjectile {
	constructor(x, y, direction, imageUrl) {
		this.x = 0;
		this.y = 0;
		this.direction = direction;
		this._imageUrl = imageUrl;

		this.damage = 1;

		this.radius = 5;

		SpriteManager.addEntity(this);
		this.init(x, y, direction, imageUrl);
	}

	makeSprite() {
		this.sprite = new Sprite();
		this.sprite.scale.set(2);
		this.sprite.anchor.set(0.5);
		return this.sprite;
	}

	init(x, y, direction, imageUrl) {
		this.x = x;
		this.y = y;
		this.direction = direction;
		this._imageUrl = imageUrl;
		this.setBitmap(ImageManager.lProjectile(this._imageUrl));

		this.onPlayerHit = null;

		// init fields
		this.speed = 3;

		this._collided = false;
		this._collidedAni = 0;

		this._aniamtionWait = 0;
		this._animation = 0;

		this._startAnimation = 0;

		// refresh sprite
		this.sprite.scale.set(0);
		this.sprite.alpha = 1;
	}

	setBitmap(b) {
		this._frameWidth = 0;
		this._frameCount = 1;

		this.sprite.bitmap = b;
		this.sprite.visible = false;

		this.sprite.bitmap.addLoadListener(() => {
			this.sprite.visible = true;
			this._frameWidth = this.sprite.bitmap.height;
			this._frameCount = this.sprite.bitmap.width / this.sprite.bitmap.height;
			this.refreshFrame();
		});
	}

	onPoolRemove() {
		if(this.sprite) {
			this.sprite.visible = false;
		}
	}

	onPoolClear() {
		if(this.sprite) {
			this.sprite.destroy();
			this.sprite = null;
		}
	}

	update() {
		if(this.updateCollision()) {
			return true;
		}
		this.updateStartAnimation();
		this.updateAnimation();
		return this.updateMovement();
	}

	updateCollision() {
		if(this._collided) {
			this._collidedAni += 0.08;
			if(this._collidedAni > 1) this._collidedAni = 1;

			const r = this._collidedAni;
			if(r < 0.5) {
				const a = r / 0.5;
				this.sprite.scale.set(2 * (1 + (0.3 * a.cubicOut())), 2 * (1 - (0.3 * a.cubicOut())));
			} else {
				const b = ((r - 0.5) / 0.5);
				this.sprite.scale.set(2 * (1.3 * (1 - b).cubicOut()), 2 * (0.7 + (0.7 * b.cubicOut())));
			}
			
			this.alpha = (1 - (this._collidedAni * 2).cubicOut()).clamp(0, 1);

			if(this._collidedAni >= 1) {
				return true;
			}
		}
		return false;
	}

	updateStartAnimation() {
		if(this._startAnimation < 1) {
			this._startAnimation += 0.05;
			if(this._startAnimation > 1) this._startAnimation = 1;

			const r = this._startAnimation;
			if(r < 0.5) {
				const a = r / 0.5;
				this.sprite.scale.set(a * 2.5);
			} else {
				const b = ((r - 0.5) / 0.5);
				this.sprite.scale.set(2.5 - (b * 0.5));
			}
			
		}
	}

	updateAnimation() {
		if(!this._frameWidth) return;
		this._aniamtionWait += 0.4;
		if(this._aniamtionWait >= 1) {
			this._aniamtionWait = 0;
			this._animation++;
			if(this._animation >= this._frameCount) {
				this._animation = 0;
			}
			this.refreshFrame();
		}
	}

	refreshFrame() {
		this.sprite.setFrame(this._frameWidth * this._animation, 0, this._frameWidth, this._frameWidth);
	}

	onCollide() {
		this._collided = true;
		this.speed = 0;
	}

	updateMovement() {
		const rads = this.direction * (Math.PI / 180);
		const xSpd = -this.speed * Math.cos(rads);
		const ySpd = this.speed * Math.sin(rads);

		CollisionManager.setProjectileCollisionCheck();

		this.x = Math.round(CollisionManager.processMovementX(this.x, this.y, xSpd));
		this.sprite.x = this.x;

		if(!CollisionManager.MoveSuccessful) {
			this.onCollide();
			return false;
		}

		this.y = Math.round(CollisionManager.processMovementY(this.x, this.y, ySpd));
		this.sprite.y = this.y;

		if(!CollisionManager.MoveSuccessful) {
			this.onCollide();
			return false;
		}

		if($gameTemp.projectileReactors) {
			for(const reactors of $gameTemp.projectileReactors) {
				if(reactors.checkProjectile(this.x, this.y)) {
					this.onCollide();
					return false;
				}
			}
		}

		if(this.owner !== $ppPlayer) {
			if($ppPlayer.checkProjectile(this, this.x, this.y)) {
				this.onCollide();
				return false;
			}
		}

		this.time++;
		this.lifetime--;
		return this.lifetime <= 0;
	}
}