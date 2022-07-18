class Spikes {
	constructor(globalTileX, globalTileY) {
		this.x = globalTileX;
		this.y = globalTileY;

		this._isOpen = true;
		this._openness = 1;
		this._isOpening = true;

		this.removeOnClose = true;

		SpriteManager.addEntity(this);
		CollisionManager.registerSpikeCollision(globalTileX, globalTileY);
	}

	makeSprite() {
		this.sprite = new Sprite(ImageManager.lEntities("Spikes"));
		this.sprite.x = this.x * TS;
		this.sprite.y = this.y * TS;
		this.sprite.scale.set(2);
		this.setAnimationFrame(0);
		return this.sprite;
	}

	setAnimationFrame(f) {
		if(this.sprite && f >= 0 && f < 9) {
			this.sprite.setFrame(f * 16, 0, 16, 16);
		}
	}

	setAnimationFrameFromRatio(r) {
		const f = Math.floor(r * 9).clamp(0, 8);
		this.setAnimationFrame(f);
	}

	open() {
		this._isOpen = true;
		this._isOpening = true;
	}

	close() {
		this._isOpen = false;
		this._isOpening = true;
	}

	removeSelf() {
		if(this.sprite) {
			this.sprite.parent.removeChild(this.sprite);
			this.sprite.destroy();
			this.sprite = null;
		}
		$gameMap.removeEntity(this);
		CollisionManager.clearCollision(this.x, this.y);
	}

	update() {
		if(this._isOpening) {
			const newOpen = this._openness.moveTowardsCond(this._isOpen, 0, 1, 0.05);
			if(this._openness !== newOpen) {
				this._openness = newOpen;
				this.setAnimationFrameFromRatio(1 - newOpen);
			} else {
				this._isOpening = false;
				if(this._openness === 0 && this.removeOnClose) {
					this.removeSelf();
				}
			}
		}
	}
}