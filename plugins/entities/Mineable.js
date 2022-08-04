
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

		this._miningSpeed = 0.06;

		this._mined = false;

		this._spawnAnimation = 1;
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
			this.heartContainer.destroy();
			this.heartContainer = null;
		}

		if(this.noChunkGen) {
			CollisionManager.clearCollision(this.globalX, this.globalY);
		} else {
			const width2 = (GenerationManager.GLOBAL_WIDTH / 2);
			const height2 = (GenerationManager.GLOBAL_HEIGHT / 2);
			CollisionManager.clearCollision(this.globalX + width2, this.globalY + height2 + 1);
		}
	}

	onPoolClear() {
		if(this.baseSprite) {
			this.baseSprite.destroy();
			this.baseSprite = null;
		}

		if(this.heartContainer) {
			this.heartContainer.destroy();
			this.heartContainer = null;
		}
	}

	setup(chunk, blockId, localTileX, localTileY, globalX, globalY) {
		this.chunkParent = chunk;
		this.noChunkGen = !chunk.baseSprite;
		this.blockId = blockId;

		this.x = localTileX;
		this.y = localTileY;
		this.globalX = globalX;
		this.globalY = globalY;

		if(this.noChunkGen) {
			this.realX = (32 * localTileX);
			this.realY = (32 * localTileY);
		} else {
			this.realX = chunk.baseSprite.x + (32 * localTileX);
			this.realY = chunk.baseSprite.y + (32 * localTileY);
		}

		const blockData = MineableTypes[blockId];

		this.mineSound = blockData.mineSound ?? ["Mine", 90];
		this.breakSound = blockData.breakSound ?? ["Break", 20];

		this.hitBox = blockData.hitBox ?? [0, 0, 0, 0];

		if(this.noChunkGen) {
			this.realHitBox = PP.Int32ArrayOf(
				(this.realX - (32 * this.hitBox[0])) + 16,
				(this.realX + (32 * this.hitBox[1])) + 16,
				(this.realY - (32 * this.hitBox[2])),
				(this.realY + (32 * this.hitBox[3]))
			);
		} else {
			this.realHitBox = PP.Int32ArrayOf(
				(this.realX - (32 * this.hitBox[0])),
				(this.realX + (32 * this.hitBox[1])),
				(this.realY - (32 * this.hitBox[2])) + 16,
				(this.realY + (32 * this.hitBox[3])) + 16
			);
		}
		

		this.hp = blockData.hp ?? 5;
		this.skillRequire = blockData.skillRequire ?? -1;
		this.hpIcon = blockData.hpIcon ?? "Heart";

		this.refreshPosition();

		if(this.noChunkGen) {
			CollisionManager.registerMineableCollision(globalX, globalY);
		} else {
			const width2 = (GenerationManager.GLOBAL_WIDTH / 2);
			const height2 = (GenerationManager.GLOBAL_HEIGHT / 2);
			CollisionManager.registerMineableCollision(globalX + width2, globalY + height2 + 1);
		}

		this._mined = false;
	}

	refreshPosition() {
		if(!this.baseSprite) return;
		if(this.noChunkGen) {
			this.baseSprite.move(this.realX + 16, this.realY + 32);
		} else {
			this.baseSprite.move(this.realX, this.realY + 48);
		}
	}

	refreshSpritePosition(startIndex) {
		const parent = this.baseSprite.parent;
		parent.removeChild(this.baseSprite);
		const yThreshold = this.baseSprite.y;

		let added = false;
		const len = parent.children.length;
		for(let i = startIndex; i < len; i++) {
			const c = parent.children[i];
			if(c.z === 0 && c.y > yThreshold) {
				parent.addChildAt(this.baseSprite, i - 1);
				added = true;
				break;
			}
		}
		if(!added) {
			parent.addChild(this.baseSprite);
		}
	}

	makeSprite() {
		if(this.baseSprite) return this.baseSprite;

		this.baseSprite = new Sprite();
		this.baseSprite.scale.set(2);
		this.baseSprite.anchor.set(0.5, 1);
		this.baseSprite.visible = true;
		this.baseSprite.bitmap = ImageManager.lTile(this._textureUrl);

		this.refreshPosition();

		return this.baseSprite;
	}

	update() {
		if(this.skillRequire === -1 || $ppPlayer.inventory.hasActiveSkill(this.skillRequire)) {
			this.updateSelection();
			this.updatePressed();
			this.updatePressAnimation();
		}
		this.updateSpawnAnimation();
		this.updateHeartContainer();
		this.updateTint();
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
			this.setPressed($ppPlayer.isMining());
		}
	}

	updatePressAnimation() {
		if(this._pressed || this._mineAnimation !== 0) {
			if(this._mineAnimation >= 1) {
				this._mineAnimation = 0;
				this._mined = false;
			} else if(this._mineAnimation < 1) {
				this._mineAnimation += this._miningSpeed;
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
			if(!s && this._pressed) {
				this.setPressed(false);
			}
		}
	}

	setPressed(s) {
		if(this._pressed !== s) {
			this._pressed = s;

			this._miningSpeed = $ppPlayer.calcMiningSpeed();

			if(s && this.heartContainer) {
				this.heartContainer.alpha = 1;
			}
			/*
			if(s && this.baseSprite) {
				const p = this.baseSprite.parent;
				p.removeChild(this.baseSprite);
				p.addChild(this.baseSprite);
				SpriteManager.sort();
			}
			*/
		}
	}

	static lastMineTime = -999;

	mine() {
		this.makeHearts();
		this.hp -= 1;
		this.heartContainer.children[this.hp].break();
		if(this.hp <= 0) {
			const baa = new BreakAndAbsorb(this.baseSprite, this.blockId);
			SpriteManager.ppLayer.addChild(baa);
			this.chunkParent.removeMineable(this);
			playFreqSe(this.breakSound[0], 70, 130, this.breakSound[1]);
		} else {
			if(Graphics.frameCount - Mineable.lastMineTime > 10) {
				playFreqSe(this.mineSound[0], 70, 130, this.mineSound[1]);
				Mineable.lastMineTime = Graphics.frameCount;
			}
		}
	}

	makeHearts() {
		if(!this.heartContainer) {
			const spacingX = 18;
			const spacingY = 18;
			const heartsPerRow = 5;

			this.heartContainer = new Sprite();
			this.heartContainer.filters = [new PIXI.filters.OutlineFilter(1, 0xffffff)];

			const count = this.hp;
			const rows = Math.ceil(count / heartsPerRow);
			this.heartContainer.move(this.baseSprite.x - ((Math.min(heartsPerRow, count) * spacingX) / 2), this.baseSprite.y - ((rows + 1) * spacingY) - ((this.hitBox[2] + 1) * 32));
			SpriteManager.addHud(this.heartContainer);

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

	spawnAnimation() {
		this._spawnAnimation = 0;
	}

	updateSpawnAnimation() {
		if(this._spawnAnimation < 1) {
			this._spawnAnimation += 0.04;
			if(this._spawnAnimation > 1) {
				this._spawnAnimation = 1;
				this.baseSprite.removeColorFilter();
			} else {
				const r = 1 - this._spawnAnimation;
				this.baseSprite.setColorTone([255 * r, 255 * r, 255 * r, 255 * r]);
			}

			if(this._spawnAnimation < 0.5) {
				const r = this._spawnAnimation / 0.5;
				this.baseSprite.scale.set(2 * (1 - (0.25 * r.cubicOut())),  2 * (1 + (0.25 * r.cubicOut())));
			} else {
				const r = (this._spawnAnimation - 0.5) / 0.5;
				this.baseSprite.scale.set(2 * (0.75 + (0.25 * r.cubicOut())),  2 * (1.25 - (0.25 * r.cubicOut())));
			}
		}
	}

	updateTint() {
		if(this.baseSprite) {
			this.baseSprite.tint = this._selected && $ppPlayer.selectMineables() ? 0xcccccc : 0xffffff;
		}
	}
}
