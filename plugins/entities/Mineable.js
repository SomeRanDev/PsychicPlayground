
class Mineable {
	constructor(url) {
		this.init(url);

		this.chunkParent = null;

		this.x = 0;
		this.y = 0;
		this.realX = 0;
		this.realY = 0;

		this.hitBox = null;

		this._selected = false;
		this._pressed = false;

		this._mined = false;

		this._mineAnimation = 0;

		SpriteManager.addEntity(this);
	}

	init(url) {
		this._textureUrl = url;
		if(this.baseSprite) {
			this.baseSprite.visible = true;
			this.baseSprite.bitmap = ImageManager.lTile(this._textureUrl);
		}
	}

	onPoolRemove() {
		this.baseSprite.visible = false;

		if(this.heartContainer) {
			this.heartContainer = null;
		}

		const width2 = (GenerationManager.GLOBAL_WIDTH / 2);
		const height2 = (GenerationManager.GLOBAL_HEIGHT / 2);
		CollisionManager.clearCollision(this.globalX + width2, this.globalY + height2 + 1);
	}

	setup(chunk, blockId, localTileX, localTileY, globalX, globalY) {
		this.chunkParent = chunk;
		this.blockId = blockId;

		this.x = localTileX;
		this.y = localTileY;
		this.globalX = globalX;
		this.globalY = globalY;
		this.realX = chunk.baseSprite.x + (32 * localTileX);
		this.realY = chunk.baseSprite.y + (32 * localTileY);

		const blockData = MineableTypes[blockId];

		this.hitBox = blockData.hitBox ?? [0, 0, 0, 0];

		this.realHitBox = PP.Int32ArrayOf(
			(this.realX - (32 * this.hitBox[0])),
			(this.realX + (32 * this.hitBox[1])),
			(this.realY - (32 * this.hitBox[2])),
			(this.realY + (32 * this.hitBox[3]))
		);

		this.hp = blockData.hp ?? 5;
		this.res = blockData.res ?? 0;
		this.hpIcon = blockData.hpIcon ?? "Heart";

		this.baseSprite.move(this.realX, this.realY + 32);

		const width2 = (GenerationManager.GLOBAL_WIDTH / 2);
		const height2 = (GenerationManager.GLOBAL_HEIGHT / 2);
		CollisionManager.registerCollision(globalX + width2, globalY + height2 + 1);

		this._mined = false;
	}

	makeSprite() {
		if(this.baseSprite) return this.baseSprite;

		this.baseSprite = new Sprite();
		this.baseSprite.scale.set(2);
		this.baseSprite.anchor.set(0.5, 1);
		this.baseSprite.visible = true;
		this.baseSprite.bitmap = ImageManager.lTile(this._textureUrl);
		return this.baseSprite;
	}

	update() {
		this.updateSelection();
		this.updatePressed();
		this.updatePressAnimation();
		this.updateHeartContainer();
	}

	updateSelection() {
		if(
			(TouchInput.worldX > this.realHitBox[0]) &&
			(TouchInput.worldX < this.realHitBox[1]) &&
			(TouchInput.worldY > this.realHitBox[2]) &&
			(TouchInput.worldY < this.realHitBox[3])
		) {
			PP.selectedObjects.push(this);
		}
	}

	updatePressed() {
		if(this._selected) {
			this.setPressed(TouchInput.isPressed());
		}
	}

	updatePressAnimation() {
		if(this._pressed || this._mineAnimation !== 0) {
			if(this._mineAnimation >= 1) {
				this._mineAnimation = 0;
				this._mined = false;
			} else if(this._mineAnimation < 1) {
				this._mineAnimation += 0.06;
				if(this._mineAnimation > 1) this._mineAnimation = 1;
			}

			if(this._mineAnimation < 0.5) {
				if(!this._mined) {
					this.mine();
					this._mined = true;
				}
				const r = this._mineAnimation / 0.5;
				this.baseSprite.scale.set(2 * (1 - (0.25 * r.cubicOut())),  2 * (1 + (0.25 * r.cubicOut())));
			} else {
				const r = (this._mineAnimation - 0.5) / 0.5;
				this.baseSprite.scale.set(2 * (0.75 + (0.25 * r.cubicOut())),  2 * (1.25 - (0.25 * r.cubicOut())));
			}
		}
	}

	setSelected(s) {
		if(this._selected !== s) {
			this._selected = s;
			this.baseSprite.tint = s ? 0xdddddd : 0xffffff;
			if(!s && this._pressed) {
				this.setPressed(false);
			}
		}
	}

	setPressed(s) {
		if(this._pressed !== s) {
			this._pressed = s;
			if(s && this.heartContainer) {
				this.heartContainer.alpha = 1;
			}
		}
	}

	mine() {
		this.makeHearts();
		this.hp -= 1;
		this.heartContainer.children[this.hp].break();
		if(this.hp <= 0) {
			const baa = new BreakAndAbsorb(this.baseSprite, this.blockId);
			SpriteManager.ppLayer.addChild(baa);
			this.chunkParent.removeBlock(this);
		}
	}

	makeHearts() {
		if(!this.heartContainer) {
			const spacingX = 18;
			const spacingY = 18;
			const heartsPerRow = 5;

			this.heartContainer = new Sprite();

			const count = this.hp;
			const rows = Math.ceil(count / heartsPerRow);
			this.heartContainer.move(this.baseSprite.x - ((Math.min(heartsPerRow, count) * spacingX) / 2), this.baseSprite.y - ((this.hitBox[2] + rows + 1) * 32));
			SpriteManager.addUi(this.heartContainer);

			const heartContainer = this.heartContainer;

			for(let i = 0; i < count; i++) {
				const h = HeartObjectPool.getObject(this.hpIcon, this.onHeartAnimationComplete.bind(this, heartContainer));
				this.heartContainer.addChild(h);
				h.x = (i % 5) * spacingX;
				h.y = (rows - Math.floor(i / heartsPerRow)) * spacingY;
			}
		}
	}

	onHeartAnimationComplete(heartContainer, self) {
		HeartObjectPool.removeObject(self);
		if(heartContainer.children.length <= 0) {
			SpriteManager.uiContainer.removeChild(heartContainer);
			heartContainer.destroy();
		}
	}

	updateHeartContainer() {
		if(!this._pressed && this.heartContainer) {
			this.heartContainer.alpha -= 0.1;
		}
	}
}
