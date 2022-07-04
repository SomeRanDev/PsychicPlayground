
class Chunk {
	static TileRef = {
		0: { name: "Grass", type: 1 },
		200: { name: "Sand", type: 0 }
	}

	static TextureRef = {};

	tileSprites = [];
	underTileSprites = [];
	refreshTiles = [];

	constructor(chunkX, chunkY) {
		this.baseSprite = new Sprite();
		this.baseSprite.scale.set(2);

		this.lowerLayer = new Sprite();
		this.baseSprite.addChild(this.lowerLayer);

		this.middleLayer = new Sprite();
		this.baseSprite.addChild(this.middleLayer);

		SpriteManager.addChunk(this.baseSprite);
		this.setPosition(chunkX, chunkY);
	}

	setPosition(chunkX, chunkY) {
		this.chunkX = chunkX;
		this.chunkY = chunkY;
		this.baseSprite.move(this.chunkX * GenerationManager.TILE_WIDTH * GenerationManager.TILES_X, this.chunkY * GenerationManager.TILE_HEIGHT * GenerationManager.TILES_Y);
		this.generateAllTiles();
	}

	update() {
		this.generateSomeTiles();
	}

	generateAllTiles() {
		this._generatedTiles = 0;
		this._maxTiles = (GenerationManager.TILES_X * GenerationManager.TILES_Y);
		this.generateSomeTiles();
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
			const newMax = Math.max(this._maxTiles, this._generatedTiles + 1);
			while(this._generatedTiles < newMax) {
				const x = this._generatedTiles % GenerationManager.TILES_X;
				const y = Math.floor(this._generatedTiles / GenerationManager.TILES_X);
				this.generateTile(x, y);
				this._generatedTiles++;
			}
		}
	}

	generateTile(x, y, allowRefresh = true) {
		let tile = GenerationManager.getTile(this.chunkX, this.chunkY, x, y);
		if(allowRefresh && GenerationManager.RefreshTile) {
			this.refreshTiles.push([x, y]);
		}
		if(!this.setupSprite(this.getSprite(x, y), (tile >> 8) & 255)) {
			this.setupSprite(this.getUnderSprite(x, y), tile & 255);
		} else {
			this.hideUnderSprite(x, y);
		}
	}

	getSprite(x, y) {
		const i = (y * GenerationManager.TILES_X) + x;
		if(!this.tileSprites[i]) {
			this.tileSprites[i] = new Sprite();
			this.middleLayer.addChild(this.tileSprites[i]);
		}

		const spr = this.tileSprites[i];
		spr.anchor.set(0.5);
		spr.move(x * 16, y * 16);
		return spr;
	}

	getUnderSprite(x, y) {
		const i = (y * GenerationManager.TILES_X) + x;
		if(!this.underTileSprites[i]) {
			this.underTileSprites[i] = new Sprite();
			this.lowerLayer.addChild(this.underTileSprites[i]);
		}

		const spr = this.underTileSprites[i];
		spr.anchor.set(0.5);
		spr.move(x * 16, y * 16);
		return spr;
	}

	hideUnderSprite(x, y) {
		const i = (y * GenerationManager.TILES_X) + x;
		if(this.underTileSprites[i]) {
			this.underTileSprites[i].visible = false;
		}
	}

	// return true = don't render below
	setupSprite(spr, tile) {
		spr.visible = tile !== 255;

		if(tile === 255) {
			return false;
		}
		
		const isAuto = tile < 200;
		const tileData = Chunk.TileRef[isAuto ? Math.floor(tile / 13) : tile];
		if(!tileData) {
			console.warn("TILE DATA INVALID??\nisAuto: " + isAuto + ", raw tile: " + tile + ", tile: " + (isAuto ? Math.floor(tile / 13) : tile));
		}
		const texture = this.getTexture(tileData.name);
		spr.bitmap = texture;

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
				return true;
			}
		} else {
			spr.setFrame(0, 0, 20, 20);
			return tileData.renderBelow ?? true;
		}

		return false;
	}


	getTexture(path) {
		if(!Chunk.TextureRef[path]) {
			Chunk.TextureRef[path] = ImageManager.lTile(path);
		}
		return Chunk.TextureRef[path];
	}
}
