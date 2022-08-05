class BreakAndAbsorb extends Sprite {
	constructor(spr, blockId, pieceSize = 8) {
		super();

		this._blockId = blockId;

		this._targetSprX = spr.x;
		this._targetSprY = spr.y;

		this._targetBitmap = spr.bitmap;
		this._pieceSize = pieceSize;
		this._update = false;
		this._spritesToMove = 0;

		this._thresholdTime = 50;

		spr.bitmap.addLoadListener(this.onBitmapReady.bind(this));
	}

	onBitmapReady() {
		this.sprites = [];

		const w = this._targetBitmap.width;
		const h = this._targetBitmap.height;

		const piecesX = w / this._pieceSize;
		const piecesY = h / this._pieceSize;

		this._midX = this._targetSprX - ((w * 2) / 2) + ((piecesX / 2) * this._pieceSize * 2) + this._pieceSize;
		this._midY = this._targetSprY - (h * 2) + ((piecesY / 2) * this._pieceSize * 2) + this._pieceSize;

		for(let y = 0; y < piecesY; y++) {
			for(let x = 0; x < piecesX; x++) {
				const spr = new Sprite(this._targetBitmap);
				spr.move(this._targetSprX - ((w * 2) / 2) + (x * this._pieceSize * 2) + this._pieceSize, this._targetSprY - (h * 2) + (y * this._pieceSize * 2) + this._pieceSize);
				spr.anchor.set(0.5, 0.5);
				spr.scale.set(2);
				spr.setFrame(x * this._pieceSize, y * this._pieceSize, this._pieceSize, this._pieceSize);
				spr._dist = 0;
				spr._baseX = spr.x;
				spr._baseY = spr.y;
				spr._angle = Math.atan2(x - (piecesX / 2), y - (piecesY / 2)) - (Math.PI * 0);
				spr._reflectX = Math.random() < 0.5 ? -1 : 1;
				spr._reflectY = Math.random() < 0.5 ? -1 : 1;
				SpriteManager.ppLayer.addChild(spr);
				this.sprites.push(spr);
			}
		}

		this._update = true;
	}

	update() {
		if(this._update) {
			let complete = 0;
			const max = Math.floor(this._spritesToMove);
			for(let i = 0; i < this.sprites.length; i++) {
				const s = this.sprites[i];
				if(!s._goToPlayer) {
					s._dist = PP.lerp(s._dist, 35, 0.2);
					s.x = s._baseX + Math.cos(s._angle) * s._dist * s._reflectX;
					s.y = s._baseY + Math.sin(s._angle) * s._dist * s._reflectY;
					if(s._dist === 35) {
						s._goToPlayer = true;
					}
				} else {
					const targetX = $ppPlayer.position.x - this.x;
					const targetY = $ppPlayer.position.y - 16 - this.y;
					let dist = Math.sqrt(Math.pow(s.x - targetX, 2) + Math.pow(s.y - targetY, 2));
					s.x = PP.lerp(s.x, targetX, dist < 15 ? 0.7 : 0.35);
					s.y = PP.lerp(s.y, targetY, dist < 15 ? 0.7 : 0.35);
					s.scale.set((dist / 40).clamp(0, 1) * 2);
					if(dist <= 5) {
						complete++;
					}
				}
			}

			if(this._thresholdTime > 0) {
				this._thresholdTime--;
			}

			if(complete === this.sprites.length || this._thresholdTime <= 0) {
				for(const s of this.sprites) {
					s.bitmap = null;
				}
				this.destroy();
				$ppPlayer.gainMaterial(this._blockId);
			}
		}
	}
}