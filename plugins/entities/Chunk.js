
class Chunk {
	static TextureRef = {};

	tileSprites = [];
	underTileSprites = [];
	upperTileSprites = [];

	unusedTileSprites = [];
	unusedUnderTileSprites = [];
	unusedUpperTileSprites = [];

	refreshTiles = [];

	blocks = [];
	enemies = [];

	constructor(chunkX, chunkY) {
		this.baseSprite = new Sprite();
		this.baseSprite.scale.set(2);

		this.lowerLayer = new Sprite();
		this.baseSprite.addChild(this.lowerLayer);

		this.middleLayer = new Sprite();
		this.baseSprite.addChild(this.middleLayer);

		this.upperLayer = new Sprite();
		this.baseSprite.addChild(this.upperLayer);

		this.blockLayer = new Sprite();
		this.baseSprite.addChild(this.blockLayer);

		SpriteManager.addChunk(this.baseSprite);
		this.setPosition(chunkX, chunkY);
	}

	onMapEnd() {
		for(const block of this.blocks) {
			block.onPoolClear();
		}
		this.blocks = [];

		this.blockLayer.destroy();
		this.upperLayer.destroy();
		this.middleLayer.destroy();
		this.lowerLayer.destroy();

		this.baseSprite.destroy();
	}

	setPosition(chunkX, chunkY) {
		this.chunkX = chunkX;
		this.chunkY = chunkY;
		this.baseSprite.move((this.chunkX * GenerationManager.CHUNK_SIZE_X) + 16, (this.chunkY * GenerationManager.CHUNK_SIZE_Y) + 16);

		this.refreshTiles = [];

		this._sortedBlocks = false;

		for(const s of this.underTileSprites) s.visible = false;
		this.unusedUnderTileSprites = this.underTileSprites.concat(this.unusedUnderTileSprites);
		this.underTileSprites = [];

		for(const s of this.upperTileSprites) s.visible = false;
		this.unusedUpperTileSprites = this.upperTileSprites.concat(this.unusedUpperTileSprites);
		this.upperTileSprites = [];

		for(const block of this.blocks) {
			MineableObjectPool.removeObject(block);
		}
		this.blocks = [];

		const startX = (this.chunkX * GenerationManager.TILES_X);
		const startY = (this.chunkY * GenerationManager.TILES_Y);
		for(let x = 0; x < GenerationManager.TILES_X; x++) {
			for(let y = 0; y < GenerationManager.TILES_Y; y++) {
				CollisionManager.clearCollision(startX + x, startY + y);
			}
		}

		if(this.structs) {
			for(const s of this.structs) {
				s.destroy();
			}
		}
		this.structs = [];

		this.globalTilePixelStartX = (this.chunkX * GenerationManager.TILES_X) * TS;
		this.globalTilePixelStartY = (this.chunkY * GenerationManager.TILES_Y) * TS;
		if($generation.enemies) {
			for(const e of $generation.enemies) {
				if(e.isWithinChunk(this)) {
					e.destroy();
				}
			}
		}

		this._animatedTiles = [];
		this._animationCounter = 0;
		this._animationFrame = 0;

		this.generateAllTiles();
	}

	update() {
		this.generateSomeTiles();
		for(const block of this.blocks) {
			block.update();
		}
		if(this._animatedTiles.length > 0) {
			const frame = Graphics.frameCount % 72;
			const aniFrame = Math.floor(frame / 24);
			if(this._animationFrame !== aniFrame) {
				this._animationFrame = aniFrame;
				for(const a of this._animatedTiles) {
					a.setFrame(20 * this._animationFrame, 0, 20, 20);
				}
			}
		}
	}

	onMouseRightClick(localTileX, localTileY) {
		const matId = $ppPlayer.inventory.hasPlacableMaterial();
		if(matId !== null &&
			CollisionManager.emptyMineableChunkPos(this.chunkX, this.chunkY, localTileX, localTileY)
		) {
			const matData = MaterialTypes[matId];
			if(matData && typeof matData.mineable === "number") {
				const mineableData = MineableTypes[matData.mineable];
				this.addBlock(localTileX, localTileY - 1, matData.mineable);
				return true;
			}
		}
		return false;
	}

	generateAllTiles() {
		this._generatedTiles = 0;
		this._maxTiles = (GenerationManager.TILES_X * GenerationManager.TILES_Y);
		this.generateStructs();
	}

	generateStructs() {
		const chunkXPos = this.chunkX + GenerationManager.OFFSET_X;
		const chunkYPos = this.chunkY + GenerationManager.OFFSET_Y;
		const chunkIndex = (chunkYPos * GenerationManager.CHUNKS_X) + chunkXPos;
		const structs = $generation.Structs[chunkIndex];
		if(structs && structs.length > 0) {
			for(const s of structs) {
				const sId = s[2];
				if(AllStructs[sId]) {
					const structEntity = AllStructs[sId].spawn(this, s[0], s[1]);
					if(structEntity.makeBackgroundSprite) {
						const backSprite = structEntity.makeBackgroundSprite();
						SpriteManager.belowLayer().addChild(backSprite);
					}
					this.structs.push(structEntity);
				}
			}
		}
	}

	generateSomeTiles() {
		if(this._generatedTiles < this._maxTiles) {
			const newMax = Math.min(this._maxTiles, this._generatedTiles + 2);
			while(this._generatedTiles < newMax) {
				const x = this._generatedTiles % GenerationManager.TILES_X;
				const y = Math.floor(this._generatedTiles / GenerationManager.TILES_X);
				this.generateTile(x, y);
				this._generatedTiles++;
			}
		} else if(!this._sortedBlocks) {
			this._sortedBlocks = true;

			SpriteManager.validate();

			this.generateEnemies();

			if(this.blocks.length > 0) {
			}
		}
	}

	generateEnemies() {
		const genOffset = () => {
			return -0.3 + (Math.random() * 0.6);
		}

		if(this.canSpawnEnemies() && $generation.shouldSpawnEnemies()) {
			let x = Math.floor(Math.random() * 8);
			let y = Math.floor(Math.random() * 8);
			const enemyType = this.getEnemyType();
			const enemyId = enemyType[0];
			const enemyFriendChance = enemyType[1];

			this.spawnEnemyAtLocalTile(x, y, enemyId);
			while(Math.random() < enemyFriendChance) {
				x += 1;
				y += 1 - Math.floor(Math.random() * 2);
				this.spawnEnemyAtLocalTile(x + genOffset(), y + genOffset(), enemyId);
			}
			while(Math.random() < enemyFriendChance) {
				x -= 1;
				y += 1 - Math.floor(Math.random() * 2);
				this.spawnEnemyAtLocalTile(x + genOffset(), y + genOffset(), enemyId);
			}
		}
	}

	getEnemyType() {
		if(BiasRandom.get("GrassEnemy", 0.7, 0.1, true)) {
			return [0, 0.3];
		}
		if(BiasRandom.get("Sheep", 0.5, 0.3, true)) {
			return [2, 0.5];
		}
		return [1, 0];
	}

	spawnEnemyAtLocalTile(localTileX, localTileY, enemyId) {
		const globalX = (GenerationManager.TILES_X * this.chunkX) + localTileX;
		const globalY = (GenerationManager.TILES_Y * this.chunkY) + localTileY;
		if(CollisionManager.canMoveToTile(globalX, globalY)) {
			const enemy = this.makeEnemy(globalX, globalY, enemyId);
			if(enemy) {
				enemy.randomizeDir()
				$generation.enemies.push(enemy);
			}
			return true;
		}
		return false;
	}

	makeEnemy(globalX, globalY, enemyId) {
		switch(enemyId) {
			case 0: return new Chaser(globalX, globalY);
			case 1: return new Blindor(globalX, globalY);
			case 2: return new CrazySheep(globalX, globalY);
		}
		return null;
	}

	//

	canSpawnEnemies() {
		if(this.chunkY < -2) return true;
		return Math.abs(this.chunkX * this.chunkY) > 9;
	}

	generateTile(x, y, allowRefresh = true) {
		let tile = $generation.getTile(this.chunkX, this.chunkY, x, y);
		/*
		if(allowRefresh && $generation.RefreshTile) {
			this.refreshTiles.push([x, y]);
			$generation.RefreshTile = false;
		}
		*/

		if(this.setupBlock(x, y, (tile >> 24) & 255)) {
			if(this.setupSprite(this.getUpperSprite(x, y), (tile >> 16) & 255)) {
				if(this.setupSprite(this.getMiddleSprite(x, y), (tile >> 8) & 255)) {
					this.setupSprite(this.getUnderSprite(x, y), tile & 255);
				} else {
					this.hideUnderSprite(x, y);
				}
			} else {
				this.hideUnderSprite(x, y);
			}
		} else {
			this.hideUnderSprite(x, y);
		}
	}

	setupBlock(x, y, blockId, spawnAnimation = false) {
		if(blockId === 255) {
			return true;
		}

		const blockData = MineableTypes[blockId];
		const name = Array.isArray(blockData.name) ? blockData.name[Math.floor(Math.random() * blockData.name.length)] : blockData.name;
		const block = MineableObjectPool.getObject(name);
		this.blocks.push(block);

		const globalX = (this.chunkX * GenerationManager.TILES_X) + x;
		const globalY = (this.chunkY * GenerationManager.TILES_Y) + y;
		block.setup(this, blockId, x, y, globalX, globalY);

		if(spawnAnimation) {
			block.spawnAnimation();
		}

		return true;
	}

	addBlock(localTileX, localTileY, blockId) {
		$generation.setTileBlock(this.chunkX, this.chunkY, localTileX, localTileY, blockId);
		this.setupBlock(localTileX, localTileY, blockId, true);
	}

	removeMineable(block) {
		if(this.blocks.includes(block)) {
			$generation.setTileBlock(this.chunkX, this.chunkY, block.x, block.y, 255);
			MineableObjectPool.removeObject(block);
			this.blocks.remove(block);
		}
	}

	getSpriteFromPool(x, y, collection, layer, unused) {
		let spr;
		if(unused.length === 0) {
			spr = new Sprite();
			layer.addChild(spr);
			collection.push(spr);
		} else {
			spr = unused.pop();
			collection.push(spr);
		}

		spr.visible = true;
		spr.anchor.set(0.5);
		spr.move(x * 16, y * 16);
		return spr;
	}

	middleTileExists(x, y) {
		const i = (y * GenerationManager.TILES_X) + x;
		if(!this.tileSprites[i]) return false;
		return this.tileSprites[i].visible && this.tileSprites[i].bitmap;
	}

	getSpriteFromIndex(x, y, collection, layer, unused) {
		const i = (y * GenerationManager.TILES_X) + x;
		let spr;
		if(!collection[i]) {
			spr = collection[i] = new Sprite();
			layer.addChild(spr);
		} else {
			spr = collection[i];
		}

		spr.visible = true;
		spr.anchor.set(0.5);
		spr.move(x * 16, y * 16);
		return spr;
	}

	//getBlockSprite(x, y) { return this.getSpriteEx(x, y, this.blockSprites, this.blockLayer, this.unusedBlockSprites); }
	getMiddleSprite(x, y) {
		return this.getSpriteFromIndex(x, y, this.tileSprites, this.middleLayer, this.unusedTileSprites);
	}

	getUnderSprite(x, y) {
		return this.getSpriteFromPool(x, y, this.underTileSprites, this.lowerLayer, this.unusedUnderTileSprites);
	}

	getUpperSprite(x, y) {
		return this.getSpriteFromPool(x, y, this.upperTileSprites, this.upperLayer, this.unusedUpperTileSprites);
	}

	hideSprite(x, y, collection) {
		const i = (y * GenerationManager.TILES_X) + x;
		if(collection[i]) {
			collection[i].visible = false;
		}
	}

	hideUnderSprite(x, y) { this.hideSprite(x, y, this.underTileSprites); }

	// return true = don't render below
	setupSprite(spr, tile, isBlock = false) {
		spr.visible = tile !== 255;

		if(tile === 255) {
			return true;
		}
		
		const isAuto = tile < 200;

		/*
		if(isAuto && (tile % 13) === 4) {
			spr.visible = tile !== 255;
			return true;
		}
		*/

		const tileData = TileTypes[isAuto ? Math.floor(tile / 13) : tile];
		if(!tileData) {
			console.warn("TILE DATA INVALID??\nisAuto: " + isAuto + ", raw tile: " + tile + ", tile: " + (isAuto ? Math.floor(tile / 13) : tile));
		}

		const texture = this.getTexture(Array.isArray(tileData.name) ? tileData.name[Math.floor(Math.random() * tileData.name.length)] : tileData.name);
		spr.bitmap = texture;

		/*
		if(tileData.name === "Grass") {
			const gx = ((this.chunkX + GenerationManager.OFFSET_X) * GenerationManager.TILES_X) + (spr.x / 32);
			const gy = ((this.chunkY + GenerationManager.OFFSET_Y) * GenerationManager.TILES_Y) + (spr.y / 32);
			const tr = 0.85 + (GenerationManager.hyperFastNoise.GetPerlinNoise(gx * 32, gy * 32) * 0.05);
			spr.tint = ((0xff * tr) << 16) | ((0xff * tr) << 8) | ((0xff * tr));
		}*/

		if(tileData.cantWalk) {
			const localX = Math.floor(spr.x / 16);
			const localY = Math.floor(spr.y / 16);
			if(!this.middleTileExists(localX, localY)) {
				const x = ((this.chunkX + GenerationManager.OFFSET_X) * GenerationManager.TILES_X) + localX;
				const y = ((this.chunkY + GenerationManager.OFFSET_Y) * GenerationManager.TILES_Y) + localY;
				CollisionManager.registerCantWalkTileCollision(x, y);
			}
		}
		

		if(tileData.isAnimated) {
			spr.setFrame(0, 0, 20, 20);
			this._animatedTiles.push(spr);
			return tileData.renderBelow ?? true;
		} else if(isAuto) {
			const autoType = tile % 13;
			let sx = 1;
			let sy = 1;
			switch(autoType) {
				case 0: { sx = 0; sy = 0; break; }
				case 1: { sx = 1; sy = 0; break; }
				case 2: { sx = 2; sy = 0; break; }
				case 3: { sx = 0; sy = 1; break; }
				case 4: { sx = 1; sy = 1; break; }
				case 5: { sx = 2; sy = 1; break; }
				case 6: { sx = 0; sy = 2; break; }
				case 7: { sx = 1; sy = 2; break; }
				case 8: { sx = 2; sy = 2; break; }

				case 9: { sx = 3; sy = 0; break; }
				case 10: { sx = 4; sy = 0; break; }
				case 11: { sx = 3; sy = 1; break; }
				case 12: { sx = 4; sy = 1; break; }
			}

			spr.setFrame(sx * 20, sy * 20, 20, 20);

			if(autoType === 4) {
				return false;
			}
		} else {
			spr.setFrame(0, 0, 20, 20);
			return tileData.renderBelow ?? true;
		}

		return true;
	}


	getTexture(path) {
		if(!Chunk.TextureRef[path]) {
			Chunk.TextureRef[path] = ImageManager.lTile(path);
		}
		return Chunk.TextureRef[path];
	}
}
