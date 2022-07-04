

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

	(U | UL | L),
	(R | UR | U),
	(D | DL | L),
	(R | DR | D),
	

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

	static AllTileData = [];
	static RefreshTile = false;

	static CHUNKS_X = 20;
	static CHUNKS_Y = 20;

	static TILES_X = 16;
	static TILES_Y = 16;

	static TILE_WIDTH = 32;
	static TILE_HEIGHT = 32;

	static start() {
		noise.seed(Math.random());

		this.OFFSET_X = (this.CHUNKS_X / 2) * this.TILES_X;
		this.OFFSET_Y = (this.CHUNKS_Y / 2) * this.TILES_Y;

		this.GLOBAL_WIDTH = this.CHUNKS_X * this.TILES_X;
	}

	static getTile(chunkX, chunkY, x, y) {
		const globalX = (chunkX * this.TILES_X) + x + this.OFFSET_X;
		const globalY = (chunkY * this.TILES_Y) + y + this.OFFSET_Y;
		const globalIndex = (globalY * this.GLOBAL_WIDTH) + globalX;
		return this.getTileGlobal(globalX, globalY, globalIndex);
	}

	static getTileGlobal(globalX, globalY, globalIndex) {
		if(!this.AllTileData.includes(globalIndex)) {
			this.AllTileData[globalIndex] = this._generateTile(globalX, globalY, globalIndex);
		}
		return this.AllTileData[globalIndex];
	}

	static _generateTile(globalX, globalY, globalIndex) {
		return(this._generateTileRaw(globalX, globalY, globalIndex, this._getMiddleTileType.bind(this)) << 8) |
			this._generateTileRaw(globalX, globalY, globalIndex, this._getLowerTileType.bind(this));
	}

	static _getMiddleTileType(globalX, globalY) {
		const globalIndex = (globalY * this.GLOBAL_WIDTH) + globalX;
		if(this.AllTileData.includes(globalIndex)) {
			const result = ((this.AllTileData[globalIndex] >> 8) & 8);
			return result > 200 ? result : Math.floor(result / 13);
		}

		let tileType = 255;
		if(noise.perlin2(globalX * 0.2, globalY * 0.2) >= 0.5) {
			tileType = 255;
		} else {
			tileType = 0;
		}
		return tileType;
	}

	static _getLowerTileType(globalX, globalY) {
		return 200;
	}

	static _generateTileRaw(globalX, globalY, globalIndex, getTileTypeFunc) {
		const tileType = getTileTypeFunc(globalX, globalY, globalIndex);
		let result = tileType;
		if(typeof tileType === "number" && tileType < 200) {
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
