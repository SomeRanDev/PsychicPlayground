

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

/*
Scene_Boot.prototype.__GenerationManager_isPlayerDataLoaded = Scene_Boot.prototype.isPlayerDataLoaded;
Scene_Boot.prototype.isPlayerDataLoaded = function() {
    return Scene_Boot.prototype.__GenerationManager_isPlayerDataLoaded.apply(this, arguments) && $generation.isReady();
};
*/

var $generation = null;

class GenerationManager {
	//static AllTileData;
	//static HasTileData;
	RefreshTile = false;

	static CHUNKS_X = 128;
	static CHUNKS_Y = 128;

	static CHUNK_SIZE_X = 8 * 32;
	static CHUNK_SIZE_Y = 8 * 32;

	static TILES_X = 8;
	static TILES_Y = 8;

	static TILE_WIDTH = 32;
	static TILE_HEIGHT = 32;

	isReady() {
		return GenerationManager.GenerationMap.isReady() && GenerationManager.GenerationMapPath.isReady();
	}

	static start() {
		this.OFFSET_X = (this.CHUNKS_X / 2);
		this.OFFSET_Y = (this.CHUNKS_Y / 2);

		this.GLOBAL_WIDTH = this.CHUNKS_X * this.TILES_X;
		this.GLOBAL_HEIGHT = this.CHUNKS_Y * this.TILES_Y;
		this.JAIL_DISTANCE = (this.GLOBAL_WIDTH / 2) - (this.TILES_X * 2);

		this.MaxTiles = this.CHUNKS_X * this.CHUNKS_Y * this.TILES_X * this.TILES_Y;
	}

	constructor(seed) {
		if(!GenerationManager.hyperFaseNoise) {
			GenerationManager.hyperFastNoise = require("./js/nativelibs/HyperFastNoise.node");
		}

		this.hash = 0;
		if(seed && seed.length > 0) {
			for(let i = 0; i < seed.length; i++) {
				this.hash = ((this.hash << 5) - this.hash) + seed.charCodeAt(i);
				this.hash |= 0;
			}
		} else {
			this.hash = Math.floor(Math.random() * 100000);
		}

		GenerationManager.hyperFastNoise.SetupNoise(this.hash);

		this.defaultBiome = new Biome_Base();
		this.biomes = [ new Biome_Base() ];
		this.redBiomes = [ new Biome_Desert() ];
		this.greenBiomes = [ new Biome_Forest() ];
		this.blueBiomes = [ new Biome_Forest() ];
		//noise.seed(Math.random());

		GenerationManager.start();

		this.HasTileData = new Int8Array(GenerationManager.MaxTiles);
		this.AllTileData = new Uint32Array(GenerationManager.MaxTiles);

		this.ReadRotation = Math.PI * 2 * ((this.hash % 1000) / 1000);
		this.GenerationMapString = "Map1";
		this.GenerationMapPathString = "Map1Path";

		GenerationManager.GenerationMap = null;
		GenerationManager.GenerationMapPath = null;
		this.refreshGenerationMap();
	}

	refreshGenerationMap() {
		GenerationManager.GenerationMap = ImageManager.lGeneration(this.GenerationMapString);//PP.rotateBitmap(ImageManager.lGeneration("Map1"), 0);
		GenerationManager.GenerationMapPath = ImageManager.lGeneration(this.GenerationMapPathString);//PP.rotateBitmap(ImageManager.lGeneration("Map1Path"), 0);
	}

	globalCoordsToIndex(globalX, globalY) {
		return (globalY * GenerationManager.GLOBAL_WIDTH) + globalX;
	}

	globalIndexToCoords(globalIndex) {
		return [ globalIndex % GenerationManager.GLOBAL_WIDTH, Math.floor(globalIndex / GenerationManager.GLOBAL_WIDTH) ];
	}

	static getPerlinNoise(x, y, index) {
		return this.hyperFastNoise.GetPerlinNoise(x, y, index);
		//return noise.perlin2(x * 0.2, y * 0.2);
	}

	generateEverything() {
		for(let i = 0; i < GenerationManager.CHUNKS_X; i++) {
			for(let j = 0; j < GenerationManager.CHUNKS_Y; j++) {
				for(let ii = 0; ii < GenerationManager.TILES_X; ii++) {
					for(let jj = 0; jj < GenerationManager.TILES_Y; jj++) {
						this.getTile(i, j, ii, jj);
					}
				}
			}
		}
	}

	GetPathAt(globalX, globalY) {
		const xRatio = 0.25 + (globalX / GenerationManager.GLOBAL_WIDTH) * 0.5;
		const yRatio = 0.25 + (globalY / GenerationManager.GLOBAL_HEIGHT) * 0.5;

		const dist = Math.sqrt(Math.pow(xRatio - 0.5, 2) + Math.pow(yRatio - 0.5, 2));
		const angle = Math.atan2(xRatio - 0.5, yRatio - 0.5) + this.ReadRotation;

		const newXRatio = (Math.cos(angle) * dist) + 0.5;
		const newYRatio = (Math.sin(angle) * dist) + 0.5;

		const pathCol = GenerationManager.GenerationMapPath.getPixelAlphaFromRatio(newXRatio, newYRatio);
		if(pathCol > 0) {
			return true;
		}
		return false;
	}

	GetGenerationPoint(xRatio, yRatio) {
		if(!GenerationManager.GenerationMap.isReady()) throw "Generation map not loaded";

		xRatio = 0.25 + (xRatio) * 0.5;
		yRatio = 0.25 + (yRatio) * 0.5;

		const dist = Math.sqrt(Math.pow(xRatio - 0.5, 2) + Math.pow(yRatio - 0.5, 2));
		const angle = Math.atan2(xRatio - 0.5, yRatio - 0.5) + this.ReadRotation;

		const newXRatio = (Math.cos(angle) * dist) + 0.5;
		const newYRatio = (Math.sin(angle) * dist) + 0.5;

		const col = GenerationManager.GenerationMap.getPixelNumberFromRatio(newXRatio, newYRatio);
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

	getBiome(globalX, globalY) {
		const col = this.GetGenerationPoint(
			globalX / GenerationManager.GLOBAL_WIDTH,
			globalY / GenerationManager.GLOBAL_HEIGHT
		);
		const type = col === 0 ? 0 : Math.floor((col - 1) / 2);

		let biomes = null;
		switch(type) {
			case 0: { biomes = this.biomes; break; }
			case 1: { biomes = this.redBiomes; break; }
			case 2: { biomes = this.greenBiomes; break; }
			case 3: { biomes = this.blueBiomes; break; }
		}

		if(biomes !== null) {
			var r = GenerationManager.hyperFastNoise.GetCellularNoise1(globalX, globalY);
			r = (r + 1) / 2.0;
			const index = Math.floor(r * biomes.length);
			return biomes[index];
		}
		return this.defaultBiome;
	}

	getTileRatio(xRatio, yRatio) {
		const globalX = Math.floor(GenerationManager.GLOBAL_WIDTH * xRatio);
		const globalY = Math.floor(GenerationManager.GLOBAL_HEIGHT * yRatio);
		const globalIndex = (globalY * GenerationManager.GLOBAL_WIDTH) + globalX;
		return this.getTileGlobal(globalX, globalY, globalIndex);
	}

	getTile(chunkX, chunkY, x, y) {
		const globalX = ((chunkX + GenerationManager.OFFSET_X) * GenerationManager.TILES_X) + x;
		const globalY = ((chunkY + GenerationManager.OFFSET_Y) * GenerationManager.TILES_Y) + y;
		const globalIndex = (globalY * GenerationManager.GLOBAL_WIDTH) + globalX;
		return this.getTileGlobal(globalX, globalY, globalIndex);
	}

	setTileBlock(chunkX, chunkY, x, y, blockId) {
		const globalX = ((chunkX + GenerationManager.OFFSET_X) * GenerationManager.TILES_X) + x;
		const globalY = ((chunkY + GenerationManager.OFFSET_Y) * GenerationManager.TILES_Y) + y;
		const globalIndex = (globalY * GenerationManager.GLOBAL_WIDTH) + globalX;
		let data = this.getData(globalIndex);
		data = (data & ((255 << 16) | (255 << 8) | 255)) | (blockId << 24);
		this.setData(globalIndex, data);
	}

	hasData(index) {
		return this.HasTileData[index] === 1;
	}

	getData(index) {
		return this.AllTileData[index];
	}

	setData(index, data) {
		this.AllTileData[index] = data;
		this.HasTileData[index] = 1;
	}

	getTileGlobal(globalX, globalY, globalIndex) {
		if(!this.hasData(globalIndex)) {
			this.setData(globalIndex, this._generateTile(globalX, globalY, globalIndex));
		}
		return this.getData(globalIndex);
	}

	_generateTile(globalX, globalY, globalIndex) {
		const midTile = this._getMiddleTileType(globalX, globalY);
		const mid = this._generateTileRaw(midTile, globalX, globalY, globalIndex, this._getMiddleTileType.bind(this));

		const lowTile = this._getLowerTileType(globalX, globalY);
		const low = this._generateTileRaw(lowTile, globalX, globalY, globalIndex, this._getLowerTileType.bind(this));

		const block = this._getBlockTileType(globalX, globalY, globalIndex, low, mid, ((mid << 8) | low));

		const top = this._getUpperTileType(globalX, globalY, low, mid, block, ((block << 24) | (mid << 8) | low));
		//const top = this._generateTileRaw(topTile, globalX, globalY, globalIndex, this._getUpperTileType.bind(this));

		return (block << 24) | (top << 16) | (mid << 8) | low;
	}

	_getBlockTileType(globalX, globalY, globalIndex, low, mid, total) {
		if(this.hasData(globalIndex)) {
			const result = ((this.getData(globalIndex) >> 24) & 255);
			return Math.floor(result / 13);
		}

		const dist = Math.sqrt(Math.pow((GenerationManager.GLOBAL_WIDTH / 2) - globalX, 2) + Math.pow((GenerationManager.GLOBAL_HEIGHT / 2) - globalY, 2));
		if(dist >= GenerationManager.JAIL_DISTANCE && dist < GenerationManager.JAIL_DISTANCE + 4) {
			return 99;
		}

		return this.getBiome(globalX, globalY).getBlockType(globalX, globalY, globalIndex, low, mid, total);
	}

	_getUpperTileType(globalX, globalY, low, mid, block, total) {
		const globalIndex = this.globalCoordsToIndex(globalX, globalY);
		if(this.hasData(globalIndex)) {
			const result = ((this.getData(globalIndex) >> 16) & 255);
			return result > 200 ? result : Math.floor(result / 13);
		}
		return this.getBiome(globalX, globalY).getUpperType(globalX, globalY, globalIndex, low, mid, block, total);
	}

	_getMiddleTileType(globalX, globalY) {
		const globalIndex = (globalY * GenerationManager.GLOBAL_WIDTH) + globalX;
		if(this.hasData(globalIndex)) {
			const result = ((this.getData(globalIndex) >> 8) & 255);
			return result > 200 ? result : Math.floor(result / 13);
		}
		return this.getBiome(globalX, globalY).getMiddleType(globalX, globalY, globalIndex);
	}

	_getLowerTileType(globalX, globalY) {
		const globalIndex = (globalY * GenerationManager.GLOBAL_WIDTH) + globalX;
		return this.getBiome(globalX, globalY).getLowerType(globalX, globalY, globalIndex);
	}

	_generateTileRaw(tileType, globalX, globalY, globalIndex, getTileTypeFunc) {
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
				this.RefreshTile = true;
			}
		}

		return result;
	}
}

//GenerationManager.start();

$generation = new GenerationManager("test");
