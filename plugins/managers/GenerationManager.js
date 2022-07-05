

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

class GenerationManager {
	static chunkData = {};

	static AllTileData;
	static HasTileData;
	static RefreshTile = false;

	static CHUNKS_X = 64;
	static CHUNKS_Y = 64;

	static CHUNK_SIZE_X = 8 * 32;
	static CHUNK_SIZE_Y = 8 * 32;

	static TILES_X = 8;
	static TILES_Y = 8;

	static TILE_WIDTH = 32;
	static TILE_HEIGHT = 32;

	static start() {
		this.hyperFastNoise = require("./js/nativelibs/HyperFastNoise.node");
		this.hyperFastNoise.SetupNoise(Math.floor(Math.random() * 100000));

		//noise.seed(Math.random());

		this.OFFSET_X = (this.CHUNKS_X / 2);
		this.OFFSET_Y = (this.CHUNKS_Y / 2);

		this.GLOBAL_WIDTH = this.CHUNKS_X * this.TILES_X;

		this.HasTileData = new Int8Array(this.CHUNKS_X * this.CHUNKS_Y * this.TILES_X * this.TILES_Y);
		this.AllTileData = new Int32Array(this.CHUNKS_X * this.CHUNKS_Y * this.TILES_X * this.TILES_Y);
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

	static getTile(chunkX, chunkY, x, y) {
		const globalX = ((chunkX + this.OFFSET_X) * this.TILES_X) + x;
		const globalY = ((chunkY + this.OFFSET_Y) * this.TILES_Y) + y;
		const globalIndex = (globalY * this.GLOBAL_WIDTH) + globalX;
		return this.getTileGlobal(globalX, globalY, globalIndex);
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
		const block = this._getBlockTileType(globalX, globalY, globalIndex);

		const midTile = this._getMiddleTileType(globalX, globalY);
		const mid = this._generateTileRaw(midTile, globalX, globalY, globalIndex, this._getMiddleTileType.bind(this));

		const lowTile = this._getLowerTileType(globalX, globalY);
		const low = this._generateTileRaw(lowTile, globalX, globalY, globalIndex, this._getLowerTileType.bind(this));
		return (block << 24) | (mid << 8) | low;
	}

	static _getBlockTileType(globalX, globalY, globalIndex) {
		if(this.hasData(globalIndex)) {
			const result = ((this.getData(globalIndex) >> 24) & 255);
			return Math.floor(result / 13);
		}

		if(this.getPerlinNoise((globalX * 20) + 2000, (globalY * 20) + 2000, globalIndex) >= 0.4) {
			return 0;
		}
		return 255;
	}

	static _getMiddleTileType(globalX, globalY) {
		const globalIndex = (globalY * this.GLOBAL_WIDTH) + globalX;
		if(this.hasData(globalIndex)) {
			const result = ((this.getData(globalIndex) >> 8) & 255);
			return result > 200 ? result : Math.floor(result / 13);
		}

		let tileType = 255;
		if(this.getPerlinNoise(globalX * 20, globalY * 20, globalIndex) >= 0.6) {
			tileType = 255;
		} else {
			tileType = 0;
		}
		return tileType;
	}

	static _getLowerTileType(globalX, globalY) {
		return 200;
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
