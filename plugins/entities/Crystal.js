class Crystal {
	constructor(globalTileX, globalTileY) {
		this.x = globalTileX;
		this.y = globalTileY;

		this._animationRatio = 0;

		this._crystalHover = 0;

		this._coreTargetPosition = { x: (19 * TS) + 16, y: (7 * TS) + 32 };

		this._targetActivate = false;
		this._coreAnimation = false;
		this._isBreaking = false;
		this._breakness = 0;

		$gameMap.addProjectileReactor(this);

		SpriteManager.addEntity(this);
		CollisionManager.registerSpikeCollision(globalTileX, globalTileY);
	}

	checkProjectile(x, y) {
		const px = this.x * TS;
		const py = this.y * TS;
		if((x > (px - 9)) && (x < (px + 9)) && (y > (py - 48)) && (y < (py + 6))) {
			this._isBreaking = true;
			this._animationRatio = 0;
			this._crystalOutline.bitmap = this._crystalBreakBitmap;
			this.startPos = { x: this.sprite.x, y: this.sprite.y };
			$gameMap.removeProjectileReactor(this);
			$gameScreen.startShake(3, 6, 10);
			this.setAnimationFrame(0);
			return true;
		}
		return false;
	}

	makeSprite() {
		this.sprite = new Sprite();
		this.sprite.anchor.set(0.5, 1);
		this.sprite.x = this.x * TS;
		this.sprite.y = this.y * TS;
		this.sprite.scale.set(2);

		this._shadow = new Sprite(ImageManager.lEntities("Shadow1"));
		this._shadow.anchor.set(0.5, 1);
		this._shadow.alpha = 0.5;
		this.sprite.addChild(this._shadow);

		this._crystalOutline = new Sprite(ImageManager.lEntities("CrystalOutline"));
		this._crystalOutline.anchor.set(0.5, 1);
		this._crystalOutline.y = -12;
		this.sprite.addChild(this._crystalOutline);

		this._crystalBreakBitmap = ImageManager.lEntities("CrystalBreak");

		this._crystalCore = new Sprite(ImageManager.lEntities("CrystalCore"));
		this._crystalCore.anchor.set(0.5, 0.5);
		this._crystalCore.y = -8;
		this._crystalOutline.addChild(this._crystalCore);

		this._crystalColor = new Sprite(ImageManager.lEntities("CrystalColor"));
		this._crystalColor.anchor.set(0.5, 1);
		this._crystalColor.alpha = 0.8;
		this._crystalOutline.addChild(this._crystalColor);

		this.setAnimationFrame(0);

		return this.sprite;
	}

	setAnimationFrame(f) {
		if(this._crystalOutline && f >= 0 && f < 9) {
			this._crystalOutline.setFrame(f * 16, 0, 16, 16);
		}
	}

	setAnimationFrameFromRatio(r) {
		if(this._isBreaking) {
			const f = Math.floor(r * 7).clamp(0, 6);
			this.setAnimationFrame(f);
			return;
		}
		const f = Math.floor(r * 9).clamp(0, 8);
		this.setAnimationFrame(f);
	}

	removeSelf() {
		if(this.sprite) {
			this.sprite.parent.removeChild(this.sprite);
			this.sprite.destroy();
			this.sprite = null;
		}
		$gameMap.removeProjectileReactor(this);
		$gameMap.removeEntity(this);
		CollisionManager.clearCollision(this.x, this.y);
	}

	update() {
		if(!this._isBreaking) {

			this._animationRatio += 0.02;
			while(this._animationRatio > 1) this._animationRatio -= 1;
			this.setAnimationFrameFromRatio(this._animationRatio);

			this._crystalHover += 0.01;
			const r = Math.sin(Math.PI * 2 * this._crystalHover);
			this._crystalOutline.y = -6 + (2 * r);
			this._shadow.scale.set(0.8 + (r * 0.1));
			this._shadow.alpha = 0.5 + (r * 0.1);

		} else if(!this._targetActivate) {

			this._animationRatio += 0.03;
			if(this._animationRatio > 1) this._animationRatio = 1;
			this.setAnimationFrameFromRatio(this._animationRatio.clamp(0, 1));

			this._crystalColor.alpha = 0.8 * (1 - this._animationRatio);
			this._shadow.alpha = 0.5 * (1 - this._animationRatio);

			const r = this._animationRatio;
			if(r < 0.3) {
				const rr = (r / 0.3).cubicOut();
				this._crystalCore.scale.set(1 - (rr * 0.8), 1 + (rr * 1));
			} else {
				const rr = (((r - 0.3) / 0.7)).cubicIn();
				this._crystalCore.scale.set(0.2 + (rr * 1.6), 2 - (rr * 2));
			}

			// ----

			if(this._animationRatio >= 1) {
				this._targetActivate = true;
				this._animationRatio = 0;
				this._crystalColor.alpha = 0;

				if(this.onHit) this.onHit();
				this.removeSelf();
			}

		}
	}
}