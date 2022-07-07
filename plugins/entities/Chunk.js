
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

	setPosition(chunkX, chunkY) {
		this.chunkX = chunkX;
		this.chunkY = chunkY;
		this.baseSprite.move((this.chunkX * GenerationManager.CHUNK_SIZE_X) + 16, (this.chunkY * GenerationManager.CHUNK_SIZE_Y) + 16);

		this.refreshTiles = [];
		
		//this.unusedTileSprites = this.tileSprites.concat(this.unusedTileSprites);
		//this.tileSprites = [];

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

		this.generateAllTiles();
	}

	update() {
		this.generateSomeTiles();
		for(const block of this.blocks) {
			block.update();
		}
	}

	onMouseClick(x, y) {
	}

	generateAllTiles() {
		this._generatedTiles = 0;
		this._maxTiles = (GenerationManager.TILES_X * GenerationManager.TILES_Y);
		//this.generateSomeTiles();

		/*for(let x = 0; x < GenerationManager.TILES_X; x++) {
			for(let y = 0; y < GenerationManager.TILES_Y; y++) {
				this.generateTile(x, y);
			}
		}*/
		/*
		if(this.refreshTiles.length > 0) {
			for(const tile of this.refreshTiles) {
				this.generateTile(tile[0], tile[1], false);
			}
			this.refreshTiles = [];
		}*/
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

			if(this.blocks.length > 0) {
				let parent = this.blocks[0].parent;

				if(parent) {
					let smallestY = 999999999;
					let smallestYBlock = null;
					for(let i = 0; i < this.blocks.length; i++) {
						if(this.blocks[i].y < smallestY) {
							smallestYBlock = this.blocks[i];
							smallestY = smallestYBlock.y;
						}
					}

					SpriteManager.sort();

					const startIndex = parent.children.indexOf(smallestYBlock);
					for(const b in this.blocks) {
						b.refreshSpritePosition(startIndex);
					}
				}
			}
		}

		//this.refreshSpritePosition();
		/*else if(this.refreshTiles.length > 0) {
			for(const tile of this.refreshTiles) {
				this.generateTile(tile[0], tile[1], false);
			}
			this.refreshTiles = [];
		}
		*/
	}

	generateTile(x, y, allowRefresh = true) {
		let tile = GenerationManager.getTile(this.chunkX, this.chunkY, x, y);
		/*
		if(allowRefresh && GenerationManager.RefreshTile) {
			this.refreshTiles.push([x, y]);
			GenerationManager.RefreshTile = false;
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

	setupBlock(x, y, blockId) {
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

		return !blockData.hideTiles;
	}

	removeBlock(block) {
		if(this.blocks.includes(block)) {
			GenerationManager.setTileBlock(this.chunkX, this.chunkY, block.x, block.y, 255);
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
		

		if(isAuto) {
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
