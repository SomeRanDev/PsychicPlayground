

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

	chunkCounter = 0;
	enemies = [];

	static CHUNKS_X = 128;
	static CHUNKS_Y = 128;

	static CHUNK_SIZE_X = 8 * 32;
	static CHUNK_SIZE_Y = 8 * 32;

	static TILES_X = 8;
	static TILES_Y = 8;

	static TILE_WIDTH = 32;
	static TILE_HEIGHT = 32;

	shouldSpawnEnemies() {
		if(this.enemies.length > 12) {
			return false;
		}
		if((this.chunkCounter++) > 2) {
			this.chunkCounter = 0;
			return true;
		}
		return false;
	}

	save() {

		const structObj = {};
		for(let i = 0; i < this.Structs.length; i++) {
			if(this.Structs[i]) {
				structObj[i] = this.Structs[i];
			}
		}

		return JSON.stringify([
			Array.from(this.HasTileData),
			Array.from(this.AllTileData),
			JSON.stringify(structObj),
			this.ReadRotation,
			this.GenerationMapString,
			this.GenerationMapPathString,
			this.seed,
			this.hash,
			this.isMapGenerated,
			this.redTarget,
			this.greenTarget,
			this.blueTarget,
			this.mapStorePos,
			this.foodStorePos,
			this.initFastTravelPos
		]);
	}

	load(stringData) {
		const data = JSON.parse(stringData);

		this.HasTileData = Int8Array.from(data[0]);
		this.AllTileData = Uint32Array.from(data[1]);

		const structObj = JSON.parse(data[2]);
		const structKeys = Object.keys(structObj);
		for(let i = 0; i < structKeys.length; i++) {
			const index = structKeys[i];
			while(this.Structs.length < index) {
				this.Structs.push(null);
			}
			this.Structs[index] = structObj[index];
		}

		this.LoadedStructs = true;

		this.ReadRotation = data[3];
		this.GenerationMapString = data[4];
		this.GenerationMapPathString = data[5];

		this.seed = data[6];
		this.hash = data[7];

		this.isMapGenerated = data[8] ?? false;
		this.redTarget = data[9] ?? [0, 0];
		this.greenTarget = data[10] ?? [0, 0];
		this.blueTarget = data[11] ?? [0, 0];

		this.mapStorePos = data[12];
		this.foodStorePos = data[13];
		this.initFastTravelPos = data[14];

		GenerationManager.GenerationMap = null;
		GenerationManager.GenerationMapPath = null;
		this.refreshGenerationMap();
	}

	isReady() {
		return GenerationManager.GenerationMap.isReady() &&
			GenerationManager.GenerationMapPath.isReady() &&
			this.Structs?.length > 0;
	}

	onceReady(callback) {
		if(this.isReady()) {
			callback();
		} else {
			this._onceReady = callback;
		}
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

		$generation = this;

		this.LoadedStructs = false;

		this.seed = seed;
		if(!seed || seed.length <= 0) {
			this.seed = "" + (Math.floor(Math.random() * 100000));
		}

		this.hash = 0;
		if(seed && seed.length > 0) {
			for(let i = 0; i < seed.length; i++) {
				this.hash = ((this.hash << 5) - this.hash) + seed.charCodeAt(i);
				this.hash |= 0;
			}
		}

		GenerationManager.hyperFastNoise.SetupNoise(this.hash);

		this.defaultBiome = new Biome_Base();
		this.biomes = {
			name: "Grassy",
			defaultTile: this.makeTile(255, 255, 4, 200),
			biomes: [
				new Biome_Base(),
				new Biome_Base(),
				new Biome_Base(),
				new Biome_Base(),
				new Biome_Lake(),
				new Biome_Base_Tree()
			]
		};

		this.redBiomes = {
			name: "Sandy",
			defaultTile: this.makeTile(255, 255, 255, 200),
			biomes: [ new Biome_Desert() ]
		};

		this.greenBiomes = {
			name: "Foresty",
			defaultTile: this.makeTile(255, 255, 13 + 4, 200),
			biomes: [
				new Biome_Forest(),
				new Biome_Forest(),
				new Biome_Forest(),
				new Biome_Forest(),
				new Biome_Forest_Lake(),
				new Biome_Forest_Clearing()
			]
		};

		this.blueBiomes = {
			name: "Dark",
			defaultTile: this.makeTile(255, 255, 26 + 4, 200),
			biomes: [
				new Biome_Dark(),
				new Biome_Dark(),
				new Biome_Dark(),
				new Biome_Dark(),
				new Biome_Dark_Lake(),
				new Biome_Dark()
			]
		};
		//noise.seed(Math.random());

		GenerationManager.start();

		this.HasTileData = new Int8Array(GenerationManager.MaxTiles);
		this.AllTileData = new Uint32Array(GenerationManager.MaxTiles);

		this.Structs = [];

		this.ReadRotation = Math.PI * 2 * ((this.hash % 1000) / 1000);
		const mapType = Math.floor(this.getRandomNumber(1000) * 3);
		const mapTypePath = Math.floor(this.getRandomNumber(1001) * 3);
		this.GenerationMapString = "Map" + mapType;
		this.GenerationMapPathString = "Map" + mapTypePath + "Path";

		GenerationManager.GenerationMap = null;
		GenerationManager.GenerationMapPath = null;
		this.refreshGenerationMap();
	}

	makeTile(block, top, mid, low) {
		return (block << 24) | (top << 16) | (mid << 8) | low;
	}

	refreshGenerationMap() {
		GenerationManager.GenerationMap = ImageManager.lGeneration(this.GenerationMapString);
		GenerationManager.GenerationMapPath = ImageManager.lGeneration(this.GenerationMapPathString);

		GenerationManager.GenerationMap.addLoadListener(() => {
			GenerationManager.GenerationMapPath.addLoadListener(() => {
				this.onGeneratorReady();
				if(this._onceReady) {
					this._onceReady();
					this._onceReady = null;
				}
			});
		});
	}

	onGeneratorReady() {
		if(this.LoadedStructs) {
			return;
		}

		this.Structs = [];

		AllStructs[0].addToData(0, 0);

		/*

		// this code randomly generates the location of initial town's 
		// buildings and NPCs. I think it will be better to have them
		// be manually placed though.

		this.mapStorePos = this.generateRandomTownPosition(10, 8, 12);
		AllStructs[5].addToData(this.mapStorePos[0], this.mapStorePos[1]);

		this.foodStorePos = this.generateRandomTownPosition(12, 8, 12, 0, 0, this.mapStorePos[2] + (Math.PI * 2 * 0.333));
		AllStructs[6].addToData(this.foodStorePos[0], this.foodStorePos[1]);

		this.initFastTravelPos = this.generateRandomTownPosition(14, 8, 12, 0, 0, this.mapStorePos[2] + (Math.PI * 2 * 0.666));
		AllStructs[7].addToData(this.initFastTravelPos[0], this.initFastTravelPos[1]);

		
		for(let i = 11; i <= 13; i++) {
			let index = 0;
			let x = -12 + Math.floor(24 * this.getRandomNumber(((i * 2) + (index++))));
			let y = -12 + Math.floor(24 * this.getRandomNumber(((i * 3) + (index++))));
			while(!CollisionManager.canMoveToTile(x, y) && (x > -5 && x < 5 && y > 0 && y < 8)) {
				x = -12 + Math.floor(24 * this.getRandomNumber(((i * 4) + (index++))));
				y = -12 + Math.floor(24 * this.getRandomNumber(((i * 5) + (index++))));
				if(index > 100) break;
			}
			if(index <= 100) {
				AllStructs[i].addToData(x, y);
			}
		}
		*/

		const sandTile = this.makeTile(255, 255, 255, 200);
		const treeTile = this.makeTile(3, 255, 4, 200);

		const makeSmallTree = (x, y) => {
			this.setTileGlobal(x, y, treeTile);
		};

		const makeTree = (x, y) => {
			this.setTileGlobal(x, y, this.makeTile(1, 255, 4, 200));
		};

		const makeBush = (x, y) => {
			this.setTileGlobal(x, y, this.makeTile(4, 255, 4, 200));
		};

		const makeRock = (x, y) => {
			this.setTileGlobal(x, y, this.makeTile(5, 255, 4, 200));
		};

		const makeDownPath = (x, y) => {
			this.setTileGlobal(x, y, sandTile);
			this.setTileGlobal(x + 1, y, this.makeTile(255, 255, 3, 200));
			this.setTileGlobal(x - 1, y, this.makeTile(255, 255, 5, 200));
		};

		const makePathEnd = (x, y) => {
			this.setTileGlobal(x, y, sandTile);
			this.setTileGlobal(x + 1, y, this.makeTile(255, 255, 3, 200));
			this.setTileGlobal(x - 1, y, this.makeTile(255, 255, 5, 200));
			this.setTileGlobal(x, y + 1, this.makeTile(255, 255, 1, 200));
			this.setTileGlobal(x - 1, y + 1, this.makeTile(255, 255, 11, 200));
			this.setTileGlobal(x + 1, y + 1, this.makeTile(255, 255, 12, 200));
		};

		// Buildings
		AllStructs[5].addToData(8, 8);
		makePathEnd(8, 9);
		for(let i = 3; i <= 7; i++) {
			makeSmallTree(8 - 5, i);
			makeSmallTree(8 + 5, i);
		}
		for(let i = 2; i <= 5; i++) {
			makeBush(8 - i, 8);
			makeBush(8 + i, 8);
		}

		{
			const x = -10;
			const y = 6;
			AllStructs[6].addToData(x, y);
			makeDownPath(x, y + 1);
			makePathEnd(x, y + 2);
			for(let i = 1; i <= 4; i++) {
				if(this.getRandomNumber((i + 10) * 2) < 0.7) makeRock(x - i, y);
				if(this.getRandomNumber((i + 10) * 3) < 0.7) makeRock(x + i, y);
			}

			this.setTileGlobal(x, y, this.makeTile(0, 255, 255, 200));
		}

		{
			const x = -4;
			const y = 14;
			AllStructs[7].addToData(x, y);
			makePathEnd(x, y + 1);
		}

		{
			const x = 3;
			const y = 15;
			AllStructs[12].addToData(x + 1, y + 2);
			for(let xx = x - 2; xx <= (x + 3); xx++) {
				for(let yy = y - 2; yy <= (y + 2); yy++) {
					if((xx !== x && (xx - 1) !== x) || yy !== y) {
						if(this.getRandomNumber(xx * yy) < 0.9) {
							makeRock(xx, yy);
						}
					}
				}
			}
		}

		AllStructs[11].addToData(-11, 12);
		this.addCarpet(-12, 10);

		{
			const x = -5;
			const y = 20;

			AllStructs[13].addToData(x, y + 1);
			makeTree(x - 2, y);
			makeTree(x + 2, y);
			makeTree(x, y - 2);
		}

		// NPCs
		AllStructs[10].addToData(2, 2);




		/*
		this.OFFSET_X = (this.CHUNKS_X / 2);
		this.OFFSET_Y = (this.CHUNKS_Y / 2);

		this.GLOBAL_WIDTH = this.CHUNKS_X * this.TILES_X;
		this.GLOBAL_HEIGHT = this.CHUNKS_Y * this.TILES_Y;
		this.JAIL_DISTANCE = (this.GLOBAL_WIDTH / 2) - (this.TILES_X * 2);*/


		const freq = 40;
		let lastOption = -1;
		let lastOption2 = -1;
		let fastTravels = [];
		for(let x = 0; x < freq; x++) {
			for(let y = 0; y < freq; y++) {

				const xRatio = (x / freq) + ((1 / freq) * Math.random());;
				const yRatio = (y / freq) + ((1 / freq) * Math.random());;

				const globalTileX = Math.round(GenerationManager.GLOBAL_WIDTH * xRatio);
				const globalTileY = Math.round(GenerationManager.GLOBAL_HEIGHT * yRatio);

				const relX = globalTileX - (GenerationManager.GLOBAL_WIDTH / 2);
				const relY = globalTileY - (GenerationManager.GLOBAL_HEIGHT / 2);

				const dist = Math.sqrt(Math.pow(relY, 2) + Math.pow(relX, 2));

				if(dist < GenerationManager.JAIL_DISTANCE - 10 && dist > 12 && (relX > 25 || relX < -25 || relY < -10 || relY > 30)) {
					const globalIndex = (globalTileY * GenerationManager.GLOBAL_WIDTH) + globalTileX;
					const tile = this.getTileGlobal(globalTileX, globalTileY, globalIndex);

					const mid = (tile >> 8) & 255;
					const low = tile & 255;

					if(mid !== 201 && mid !== 203 && low !== 201 && low !== 203) {
						let option = lastOption;
						let index = 0;
						while(lastOption === option || lastOption2 === option) {
							let rand = this.getRandomNumber((globalIndex * 2) + (index++));
							if(rand < 0.4) {
								option = 8;
							} else if(rand < 0.5) {
								option = 7;
							} else if(rand < 0.6) {
								option = 9;
							} else if(rand < 0.75) {
								option = 14;
							} else if(rand < 0.9) {
								option = 16;
							} else if(rand < 1) {
								option = 15;
							}
						}

						if(option === 7) {
							let allowed = true;
							const len = fastTravels.length;
							for(let i = 0; i < len; i++) {
								if(Math.abs(relX - fastTravels[i][0]) < 50 || Math.abs(relY - fastTravels[i][1]) < 50) {
									allowed = false;
									break;
								}
							}
							if(!allowed) {
								option = 8;
							} else {
								fastTravels.push([relX, relY]);
							}
						}

						lastOption2 = lastOption;
						lastOption = option;

						if(AllStructs[option]) {
							AllStructs[option].addToData(relX, relY);
						}
					}
				}
			}
		}

		//const sections = 

	}

	addCarpet(x, y) {
		for(let i = 0; i < 9; i++) {
			const xoff = (i % 3);
			const yoff = Math.floor(i / 3);
			this.setTileGlobal(x + xoff, y + yoff, this.makeTile(255, (5 * 13) + i, 4, 200));
		}
	}

	generateRandomTownPosition(index, minDist, maxDist, offsetX = 0, offsetY = 0, dir = -999) {
		if(dir === -999) {
			dir = Math.PI * 2 * this.getRandomNumber(index);
		}
		const dist = minDist + (this.getRandomNumber(index + 1) * (maxDist - minDist));
		const x = Math.round(Math.cos(dir) * dist) + offsetX;
		const y = Math.round(Math.sin(dir) * dist) + offsetY;
		return [x, y, dir];
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

	_getBiomeType(globalX, globalY) {
		const index = this.globalCoordsToIndex(globalX, globalY);

		let type = 0;
		/*if(this.HasTileData[index] > 1) {
			const val = this.HasTileData[index];
			for(let i = 1; i <= 4; i++) {
				if((val & Math.pow(2, i)) !== 0) {
					type = i;
					break;
				}
			}
		} else */{
			const col = this.GetGenerationPoint(
				globalX / GenerationManager.GLOBAL_WIDTH,
				globalY / GenerationManager.GLOBAL_HEIGHT
			);
			type = col === 0 ? 0 : (Math.floor((col - 1) / 2) + 1);
		}

/*
		if(this.HasTileData[index] <= 1) {
			this.HasTileData[index] |= Math.pow(2, type + 1);
		}*/

		return type;
	}

	_isSpecialBiomeType(globalX, globalY) {
		const col = this.GetGenerationPoint(
			globalX / GenerationManager.GLOBAL_WIDTH,
			globalY / GenerationManager.GLOBAL_HEIGHT
		);
		return col % 2 === 0;
	}

	getBiome(globalX, globalY) {
		const type = this._getBiomeType(globalX, globalY);

		let biomes = null;
		switch(type) {
			case 0: { biomes = this.biomes; break; }
			case 1: { biomes = this.redBiomes; break; }
			case 2: { biomes = this.greenBiomes; break; }
			case 3: { biomes = this.blueBiomes; break; }
		}

		const absX = globalX - (GenerationManager.GLOBAL_WIDTH / 2);
		const absY = globalY - (GenerationManager.GLOBAL_HEIGHT / 2);
		const dist = Math.sqrt((absX * absX) + (absY * absY));
		if(dist < 50 || (type !== 0 && this._isSpecialBiomeType(globalX, globalY))) {
			return biomes.biomes[0];
		}

		if(biomes !== null) {
			var r = GenerationManager.hyperFastNoise.GetCellularNoise1(globalX * 3, globalY * 3);
			r = (r + 1) / 2.0;
			const index = Math.floor(r * biomes.biomes.length);
			return biomes.biomes[index];
		}
		return this.defaultBiome;
	}

	getLocationName(globalTileX, globalTileY) {
		globalTileX += GenerationManager.OFFSET_X * GenerationManager.TILES_X;
		globalTileY += GenerationManager.OFFSET_Y * GenerationManager.TILES_Y;
		const type = this._getBiomeType(globalTileX, globalTileY);

		let biomes = null;
		switch(type) {
			case 0: { biomes = this.biomes; break; }
			case 1: { biomes = this.redBiomes; break; }
			case 2: { biomes = this.greenBiomes; break; }
			case 3: { biomes = this.blueBiomes; break; }
		}

		const subBiome = this.getBiome(globalTileX, globalTileY);

		const name = biomes.name + " " + subBiome.name;
		return name;
	}

	getDefaultTile(globalTileX, globalTileY) {
		const type = this._getBiomeType(globalTileX, globalTileY);

		let biomes = null;
		switch(type) {
			case 0: { biomes = this.biomes; break; }
			case 1: { biomes = this.redBiomes; break; }
			case 2: { biomes = this.greenBiomes; break; }
			case 3: { biomes = this.blueBiomes; break; }
		}

		if(biomes !== null) {
			return biomes.defaultTile;
		}
		return this.makeTile(255, 255, 4, 200);
	}

	beginGeneration() {
		this._possibleRedTargets = [];
		this._possibleGreenTargets = [];
		this._possibleBlueTargets = [];
	}

	preGenerateFromRatio(xRatio, yRatio) {
		this.getTileRatio(xRatio, yRatio);

		const globalTileX = Math.floor(GenerationManager.GLOBAL_WIDTH * xRatio) - (GenerationManager.OFFSET_X * GenerationManager.TILES_X);
		const globalTileY = Math.floor(GenerationManager.GLOBAL_HEIGHT * yRatio) - (GenerationManager.OFFSET_Y * GenerationManager.TILES_Y);
		const biomeType = this.GetGenerationPoint(xRatio, yRatio);
		switch(biomeType) {
			case 2: {
				this._possibleRedTargets.push([globalTileX, globalTileY]);
				break;
			}
			case 4: {
				this._possibleGreenTargets.push([globalTileX, globalTileY]);
				break;
			}
			case 6: {
				this._possibleBlueTargets.push([globalTileX, globalTileY]);
				break;
			}
		}
	}

	endGeneration() {
		this.isMapGenerated = true;

		const i = this.getRandomNumber(0);
		const i1 = this.getRandomNumber(1);
		const i2 = this.getRandomNumber(2);

		this.redTarget = this._possibleRedTargets[Math.floor(i * this._possibleRedTargets.length)];
		this.greenTarget = this._possibleGreenTargets[Math.floor(i1 * this._possibleGreenTargets.length)];
		this.blueTarget = this._possibleBlueTargets[Math.floor(i2 * this._possibleBlueTargets.length)];

		if(!this.redTarget) {
			const r = this.ReadRotation + (Math.PI * 2 * 0.111);
			this.redTarget = [Math.cos(r) * 400, Math.sin(r) * 400];
			console.warn("PSYCHIC PLAYGROUND NOTE:\nHad to manually make red target.\n" + this.redTarget);
		}
		if(!this.greenTarget) {
			const r = this.ReadRotation + (Math.PI * 2 * 0.444);
			this.greenTarget = [Math.cos(r) * 400, Math.sin(r) * 400];
			console.warn("PSYCHIC PLAYGROUND NOTE:\nHad to manually make green target.\n" + this.greenTarget);
		}
		if(!this.blueTarget) {
			const r = this.ReadRotation + (Math.PI * 2 * 0.888);
			this.blueTarget = [Math.cos(r) * 400, Math.sin(r) * 400];
			console.warn("PSYCHIC PLAYGROUND NOTE:\nHad to manually make blue target.\n" + this.blueTarget);
		}

		AllStructs[1].addToData(this.redTarget[0], this.redTarget[1]);
		AllStructs[2].addToData(this.greenTarget[0], this.greenTarget[1]);
		AllStructs[3].addToData(this.blueTarget[0], this.blueTarget[1]);

		let index = 0;
		const targets = [this.redTarget, this.greenTarget, this.blueTarget];
		for(const target of targets) {
			const pos = this.generateRandomTownPosition(((index++) * 2) + 16, 11, 15, target[0], target[1]);
			AllStructs[7].addToData(pos[0], pos[1]);
		}

		this._possibleRedTargets = null;
		this._possibleGreenTargets = null;
		this._possibleBlueTargets = null;
	}

	generateAllSync(callback) {
		this.onceReady(() => {
			this.beginGeneration();

			const w = 256;
			const end = w * w;
			for(let i = 0; i < end; i++) {
				const x = (i % w);
				const y = Math.floor(i / w);
				this.preGenerateFromRatio(x / w, y / w);
			}

			this.endGeneration();

			if(callback) callback();
		});
	}

	generateAllSyncIfNotGenerated() {
		if(!this.isMapGenerated) {
			this.generateAllSync();
		}
	}

	getRandomNumber(offset) {
		// https://stackoverflow.com/a/47593316
		var t = (offset + this.hash) + 0x6D2B79F5;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;

		//return (GenerationManager.getPerlinNoise(offset * 20, offset * -20, 0) + 1) / 2;
		/*const n = this.hash + offset;
		return ((n - (((Math.sin(n) + 1) / 2) * 10000)) % 5784394) / 5784394.0;*/
	}

	getTileRatio(xRatio, yRatio) {
		const globalTileX = Math.floor(GenerationManager.GLOBAL_WIDTH * xRatio);
		const globalTileY = Math.floor(GenerationManager.GLOBAL_HEIGHT * yRatio);
		const globalIndex = (globalTileY * GenerationManager.GLOBAL_WIDTH) + globalTileX;
		return this.getTileGlobal(globalTileX, globalTileY, globalIndex);
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

	clearTile(globalTileX, globalTileY) {
		const globalTileXPos = globalTileX + (GenerationManager.OFFSET_X * GenerationManager.TILES_X);
		const globalTileYPos = globalTileY + (GenerationManager.OFFSET_Y * GenerationManager.TILES_Y);
		const globalIndex = (globalTileYPos * GenerationManager.GLOBAL_WIDTH) + globalTileXPos;
		this.setData(globalIndex, this.getDefaultTile(globalTileXPos, globalTileYPos));
	}

	setPlatformTile(globalTileX, globalTileY) {
		const globalTileXPos = globalTileX + (GenerationManager.OFFSET_X * GenerationManager.TILES_X);
		const globalTileYPos = globalTileY + (GenerationManager.OFFSET_Y * GenerationManager.TILES_Y);
		const globalIndex = (globalTileYPos * GenerationManager.GLOBAL_WIDTH) + globalTileXPos;
		this.setData(globalIndex, this.makeTile(255, 222, 4, 200));
	}

	setCarpetTile(globalTileX, globalTileY) {
		const globalTileXPos = globalTileX + (GenerationManager.OFFSET_X * GenerationManager.TILES_X);
		const globalTileYPos = globalTileY + (GenerationManager.OFFSET_Y * GenerationManager.TILES_Y);
		const globalIndex = (globalTileYPos * GenerationManager.GLOBAL_WIDTH) + globalTileXPos;
		this.setData(globalIndex, this.makeTile(255, 221, 4, 200));
	}

	setAltCarpetTile(globalTileX, globalTileY) {
		const globalTileXPos = globalTileX + (GenerationManager.OFFSET_X * GenerationManager.TILES_X);
		const globalTileYPos = globalTileY + (GenerationManager.OFFSET_Y * GenerationManager.TILES_Y);
		const globalIndex = (globalTileYPos * GenerationManager.GLOBAL_WIDTH) + globalTileXPos;
		this.setData(globalIndex, this.makeTile(255, 224, 4, 200));
	}

	setCustomTile(globalTileX, globalTileY, tile) {
		const globalTileXPos = globalTileX + (GenerationManager.OFFSET_X * GenerationManager.TILES_X);
		const globalTileYPos = globalTileY + (GenerationManager.OFFSET_Y * GenerationManager.TILES_Y);
		const globalIndex = (globalTileYPos * GenerationManager.GLOBAL_WIDTH) + globalTileXPos;
		this.setData(globalIndex, tile);
	}

	setCustomBlock(globalTileX, globalTileY, blockId) {
		const globalTileXPos = globalTileX + (GenerationManager.OFFSET_X * GenerationManager.TILES_X);
		const globalTileYPos = globalTileY + (GenerationManager.OFFSET_Y * GenerationManager.TILES_Y);
		const globalIndex = (globalTileYPos * GenerationManager.GLOBAL_WIDTH) + globalTileXPos;

		let data = this.getTileGlobal(globalTileXPos, globalTileYPos, globalIndex);
		data = (data & ((255 << 16) | (255 << 8) | 255)) | (blockId << 24);

		this.setData(globalIndex, data);
	}

	hasData(index) {
		return (this.HasTileData[index] & 1) !== 0;
	}

	getData(index) {
		return this.AllTileData[index];
	}

	setData(index, data) {
		this.AllTileData[index] = data;
		this.HasTileData[index] |= 1;
	}

	addStructToData(struct, globalTileX, globalTileY) {
		const globalTileXPos = globalTileX + (GenerationManager.OFFSET_X * GenerationManager.TILES_X);
		const globalTileYPos = globalTileY + (GenerationManager.OFFSET_Y * GenerationManager.TILES_Y);
		const chunkX = Math.floor(globalTileXPos / GenerationManager.TILES_X);
		const chunkY = Math.floor(globalTileYPos / GenerationManager.TILES_Y);
		const localTileX = globalTileXPos % GenerationManager.TILES_X;
		const localTileY = globalTileYPos % GenerationManager.TILES_Y;
		const globalIndex = (chunkY * GenerationManager.CHUNKS_X) + chunkX;

		while(this.Structs.length <= globalIndex) {
			this.Structs.push(null);
		}

		if(!this.Structs[globalIndex]) {
			this.Structs[globalIndex] = [];
		}

		this.Structs[globalIndex].push([localTileX, localTileY, struct.id]);
	}

	// Used only in initial Struct generation
	setTileGlobal(globalTileX, globalTileY, tileData) {
		const globalTileXPos = globalTileX + (GenerationManager.OFFSET_X * GenerationManager.TILES_X);
		const globalTileYPos = globalTileY + (GenerationManager.OFFSET_Y * GenerationManager.TILES_Y);
		const globalIndex = (globalTileYPos * GenerationManager.GLOBAL_WIDTH) + globalTileXPos;
		this.setData(globalIndex, tileData);
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

$generation = new GenerationManager("fdsfds");
