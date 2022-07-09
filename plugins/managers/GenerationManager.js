

let AutotilePos;

{

const U = 1;
const D = 2;
const L = 4;
const R = 8;
const UL = 16;
const UR = 32;
const DL = 64;
const DR = 128;

AutotilePos = [
	(D | R | DR),
	(L | DL | D | R | DR),
	(L | DL | D),
	(U | UR | R | DR | D),
	(U | D | L | R | UL | UR | DL | DR),
	(U | UL | L | DL | D),
	(U | UR | R),
	(L | UL | U | UR | R),
	(L | UL | U),
	(D | DL | L | UL | U | UR | R),
	(L | UL | U | UR | R | DR | D),
	(U | UL | L | DL | D | DR | R),
	(L | DL | D | DR | R | UR | U),

	(D | DL | L | UL | U | UR | R),
	(L | UL | U | UR | R | DR | D),
	(U | UL | L | DL | D | DR | R),
	(L | DL | D | DR | R | UR | U),

	(U | UL | L | D),
	(R | UR | U | D),
	(D | DL | L | U),
	(R | DR | D | U),

	(U | UL | L | R),
	(R | UR | U | L),
	(L | DL | D | R),
	(R | DR | D | L),
];

}

Scene_Boot.prototype.__GenerationManager_isPlayerDataLoaded = Scene_Boot.prototype.isPlayerDataLoaded;
Scene_Boot.prototype.isPlayerDataLoaded = function() {
    return Scene_Boot.prototype.__GenerationManager_isPlayerDataLoaded.apply(this, arguments) && GenerationManager.isReady();
};

class GenerationManager {
	static chunkData = {};

	static AllTileData;
	static HasTileData;
	static RefreshTile = false;

	static CHUNKS_X = 128;
	static CHUNKS_Y = 128;

	static CHUNK_SIZE_X = 8 * 32;
	static CHUNK_SIZE_Y = 8 * 32;

	static TILES_X = 8;
	static TILES_Y = 8;

	static TILE_WIDTH = 32;
	static TILE_HEIGHT = 32;

	static isReady() {
		return this.GenerationMap.isReady() && this.GenerationMapPath.isReady();
	}

	static start() {
		this.hyperFastNoise = require("./js/nativelibs/HyperFastNoise.node");
		this.hyperFastNoise.SetupNoise(Math.floor(Math.random() * 100000));

		this.defaultBiome = new Biome_Base();
		this.biomes = [ new Biome_Base() ];
		this.redBiomes = [ new Biome_Desert() ];
		this.greenBiomes = [ new Biome_Forest() ];
		this.blueBiomes = [ new Biome_Forest() ];
		//noise.seed(Math.random());

		this.OFFSET_X = (this.CHUNKS_X / 2);
		this.OFFSET_Y = (this.CHUNKS_Y / 2);

		this.GLOBAL_WIDTH = this.CHUNKS_X * this.TILES_X;
		this.GLOBAL_HEIGHT = this.CHUNKS_Y * this.TILES_Y;
		this.JAIL_DISTANCE = (this.GLOBAL_WIDTH / 2) - (this.TILES_X * 2);

		this.MaxTiles = this.CHUNKS_X * this.CHUNKS_Y * this.TILES_X * this.TILES_Y;
		this.HasTileData = new Int8Array(this.MaxTiles);
		this.AllTileData = new Uint32Array(this.MaxTiles);

		this.ReadRotation = Math.PI * 2 * Math.random();
		this.GenerationMap = ImageManager.lGeneration("Map1")//PP.rotateBitmap(ImageManager.lGeneration("Map1"), 0);
		this.GenerationMapPath = ImageManager.lGeneration("Map1Path")//PP.rotateBitmap(ImageManager.lGeneration("Map1Path"), 0);
	}

	static globalCoordsToIndex(globalX, globalY) {
		return (globalY * this.GLOBAL_WIDTH) + globalX;
	}

	static globalIndexToCoords(globalIndex) {
		return [ globalIndex % this.GLOBAL_WIDTH, Math.floor(globalIndex / this.GLOBAL_WIDTH) ];
	}

	static getPerlinNoise(x, y, index) {
		return this.hyperFastNoise.GetPerlinNoise(x, y, index);
		//return noise.perlin2(x * 0.2, y * 0.2);
	}

	static generateEverything() {
		for(let i = 0; i < GenerationManager.CHUNKS_X; i++) {
			for(let j = 0; j < GenerationManager.CHUNKS_Y; j++) {
				for(let ii = 0; ii < this.TILES_X; ii++) {
					for(let jj = 0; jj < this.TILES_Y; jj++) {
						this.getTile(i, j, ii, jj);
					}
				}
			}
		}
	}

	static GetPathAt(globalX, globalY) {
		const xRatio = 0.25 + (globalX / this.GLOBAL_WIDTH) * 0.5;
		const yRatio = 0.25 + (globalY / this.GLOBAL_HEIGHT) * 0.5;

		const dist = Math.sqrt(Math.pow(xRatio - 0.5, 2) + Math.pow(yRatio - 0.5, 2));
		const angle = Math.atan2(xRatio - 0.5, yRatio - 0.5) + this.ReadRotation;

		const newXRatio = (Math.cos(angle) * dist) + 0.5;
		const newYRatio = (Math.sin(angle) * dist) + 0.5;

		const pathCol = this.GenerationMapPath.getPixelAlphaFromRatio(newXRatio, newYRatio);
		if(pathCol > 0) {
			return true;
		}
		return false;
	}

	static GetGenerationPoint(xRatio, yRatio) {
		xRatio = 0.25 + (xRatio) * 0.5;
		yRatio = 0.25 + (yRatio) * 0.5;

		const dist = Math.sqrt(Math.pow(xRatio - 0.5, 2) + Math.pow(yRatio - 0.5, 2));
		const angle = Math.atan2(xRatio - 0.5, yRatio - 0.5) + this.ReadRotation;

		const newXRatio = (Math.cos(angle) * dist) + 0.5;
		const newYRatio = (Math.sin(angle) * dist) + 0.5;

		const col = this.GenerationMap.getPixelNumberFromRatio(newXRatio, newYRatio);
		//const a = (col & 0xff000000) >> 24;
		const r = (col & 0x00ff0000) >> 16;
		const g = (col & 0x0000ff00) >> 8;
		const b = (col & 0x000000ff);
		if(r >= 255 && g >= 255 && b >= 255) {
			return 0;
		} else if(r >= 255) {
			return g >= 100 ? 2 : 1;
		} else if(g >= 255) {
			return r >= 100 ? 4 : 3;
		} else if(b >= 255) {
			return r >= 100 ? 6 : 5;
		}
		throw "this should not execute??";
	}

	static getBiome(globalX, globalY) {
		const col = this.GetGenerationPoint(globalX / this.GLOBAL_WIDTH, globalY / this.GLOBAL_HEIGHT);
		const type = col === 0 ? 0 : Math.floor((col - 1) / 2);

		let biomes = null;
		switch(type) {
			case 0: { biomes = this.biomes; break; }
			case 1: { biomes = this.redBiomes; break; }
			case 2: { biomes = this.greenBiomes; break; }
			case 3: { biomes = this.blueBiomes; break; }
		}

		if(biomes !== null) {
			var r = this.hyperFastNoise.GetCellularNoise1(globalX, globalY);
			r = (r + 1) / 2.0;
			const index = Math.floor(r * biomes.length);
			return biomes[index];
		}
		return this.defaultBiome;
	}

	static getTileRatio(xRatio, yRatio) {
		const globalX = Math.floor(this.GLOBAL_WIDTH * xRatio);
		const globalY = Math.floor(this.GLOBAL_HEIGHT * yRatio);
		const globalIndex = (globalY * this.GLOBAL_WIDTH) + globalX;
		return this.getTileGlobal(globalX, globalY, globalIndex);
	}

	static getTile(chunkX, chunkY, x, y) {
		const globalX = ((chunkX + this.OFFSET_X) * this.TILES_X) + x;
		const globalY = ((chunkY + this.OFFSET_Y) * this.TILES_Y) + y;
		const globalIndex = (globalY * this.GLOBAL_WIDTH) + globalX;
		return this.getTileGlobal(globalX, globalY, globalIndex);
	}

	static setTileBlock(chunkX, chunkY, x, y, blockId) {
		const globalX = ((chunkX + this.OFFSET_X) * this.TILES_X) + x;
		const globalY = ((chunkY + this.OFFSET_Y) * this.TILES_Y) + y;
		const globalIndex = (globalY * this.GLOBAL_WIDTH) + globalX;
		let data = this.getData(globalIndex);
		data = (data & ((255 << 16) | (255 << 8) | 255)) | (blockId << 24);
		this.setData(globalIndex, data);
	}

	static hasData(index) {
		return this.HasTileData[index] === 1;
	}

	static getData(index) {
		return this.AllTileData[index];
	}

	static setData(index, data) {
		this.AllTileData[index] = data;
		this.HasTileData[index] = 1;
	}

	static getTileGlobal(globalX, globalY, globalIndex) {
		if(!this.hasData(globalIndex)) {
			this.setData(globalIndex, this._generateTile(globalX, globalY, globalIndex));
		}
		return this.getData(globalIndex);
	}

	static _generateTile(globalX, globalY, globalIndex) {
		const midTile = this._getMiddleTileType(globalX, globalY);
		const mid = this._generateTileRaw(midTile, globalX, globalY, globalIndex, this._getMiddleTileType.bind(this));

		const lowTile = this._getLowerTileType(globalX, globalY);
		const low = this._generateTileRaw(lowTile, globalX, globalY, globalIndex, this._getLowerTileType.bind(this));

		const block = this._getBlockTileType(globalX, globalY, globalIndex, low, mid, ((mid << 8) | low));

		const top = this._getUpperTileType(globalX, globalY, low, mid, block, ((block << 24) | (mid << 8) | low));
		//const top = this._generateTileRaw(topTile, globalX, globalY, globalIndex, this._getUpperTileType.bind(this));

		return (block << 24) | (top << 16) | (mid << 8) | low;
	}

	static _getBlockTileType(globalX, globalY, globalIndex, low, mid, total) {
		if(this.hasData(globalIndex)) {
			const result = ((this.getData(globalIndex) >> 24) & 255);
			return Math.floor(result / 13);
		}

		const dist = Math.sqrt(Math.pow((this.GLOBAL_WIDTH / 2) - globalX, 2) + Math.pow((this.GLOBAL_HEIGHT / 2) - globalY, 2));
		if(dist >= this.JAIL_DISTANCE && dist < this.JAIL_DISTANCE + 4) {
			return 99;
		}

		return this.getBiome(globalX, globalY).getBlockType(globalX, globalY, globalIndex, low, mid, total);
	}

	static _getUpperTileType(globalX, globalY, low, mid, block, total) {
		const globalIndex = this.globalCoordsToIndex(globalX, globalY);
		if(this.hasData(globalIndex)) {
			const result = ((this.getData(globalIndex) >> 16) & 255);
			return result > 200 ? result : Math.floor(result / 13);
		}
		return this.getBiome(globalX, globalY).getUpperType(globalX, globalY, globalIndex, low, mid, block, total);
	}

	static _getMiddleTileType(globalX, globalY) {
		const globalIndex = (globalY * this.GLOBAL_WIDTH) + globalX;
		if(this.hasData(globalIndex)) {
			const result = ((this.getData(globalIndex) >> 8) & 255);
			return result > 200 ? result : Math.floor(result / 13);
		}
		return this.getBiome(globalX, globalY).getMiddleType(globalX, globalY, globalIndex);
	}

	static _getLowerTileType(globalX, globalY) {
		const globalIndex = (globalY * this.GLOBAL_WIDTH) + globalX;
		return this.getBiome(globalX, globalY).getLowerType(globalX, globalY, globalIndex);
	}

	static _generateTileRaw(tileType, globalX, globalY, globalIndex, getTileTypeFunc) {
		//const tileType = getTileTypeFunc(globalX, globalY, globalIndex);
		let result = tileType;
		if(tileType < 200) {
			let surrond = 0;
			if(getTileTypeFunc(globalX, globalY - 1) === tileType) surrond |= 1;
			if(getTileTypeFunc(globalX, globalY + 1) === tileType) surrond |= 2;
			if(getTileTypeFunc(globalX - 1, globalY) === tileType) surrond |= 4;
			if(getTileTypeFunc(globalX + 1, globalY) === tileType) surrond |= 8;
			if(getTileTypeFunc(globalX - 1, globalY - 1) === tileType) surrond |= 16;
			if(getTileTypeFunc(globalX + 1, globalY - 1) === tileType) surrond |= 32;
			if(getTileTypeFunc(globalX - 1, globalY + 1) === tileType) surrond |= 64;
			if(getTileTypeFunc(globalX + 1, globalY + 1) === tileType) surrond |= 128;

			let index = AutotilePos.indexOf(surrond);
			if(index === -1) {
				if((surrond & 4) === 0 && (surrond & 32) === 0) {
					surrond &= ~(1 | 16 | 32);
				} else if((surrond & 8) === 0 && (surrond & 16) === 0) {
					surrond &= ~(1 | 16 | 32);
				} else if((surrond & 4) === 0 && (surrond & 128) === 0) {
					surrond &= ~(2 | 64 | 128);
				} else if((surrond & 8) === 0 && (surrond & 64) === 0) {
					surrond &= ~(2 | 64 | 128);
				} else if((surrond & 1) === 0 && (surrond & 64) === 0) {
					surrond &= ~(4 | 16 | 64);
				} else if((surrond & 1) === 0 && (surrond & 128) === 0) {
					surrond &= ~(8 | 32 | 128);
				} else if((surrond & 2) === 0 && (surrond & 16) === 0) {
					surrond &= ~(4 | 16 | 64);
				} else if((surrond & 2) === 0 && (surrond & 32) === 0) {
					surrond &= ~(8 | 32 | 128);
				}

				if((surrond & 1) === 0) {
					surrond &= ~(16 | 32);
				}
				if((surrond & 2) === 0) {
					surrond &= ~(64 | 128);
				}
				if((surrond & 4) === 0) {
					surrond &= ~(16 | 64);
				}
				if((surrond & 8) === 0) {
					surrond &= ~(32 | 128);
				}
				index = AutotilePos.indexOf(surrond);
			}

			while(index > 12) index -= 4;

			result = index === -1 ? 255 : ((tileType * 13) + index);

			if(index === -1) {
				GenerationManager.RefreshTile = true;
			}
		}

		return result;
	}
}

GenerationManager.start();
