class Struct_CaveEntrance extends Struct_Base {
	constructor(id, imgFront, imgBack) {
		super(id);
		this.imgFront = imgFront;
		this.imgBack = imgBack;
	}

	imgPath() {
		return this.imgFront;
	}

	backImgPath() {
		return this.imgBack;
	}

	size() {
		return [-1, -1, 3, 2];
	}

	clearSize() {
		return [-2, -2, 5, 3];
	}

	backOffset() {
		return [0, 8];
	}

	setupCustomCollisionResponses(globalX, globalY) {
		CollisionManager.clearStructCollision(globalX, globalY);
		CollisionManager.addTransfer(globalX, globalY, {
			id: 7, x: 17, y: 1, dir: 8, fadeType: 0
		});
	}
}

class Struct_CaveEntrance_Intro extends Struct_CaveEntrance {
	constructor(id) {
		super(id, "OrbCave_Grass_Front", "OrbCave_Grass_Back");
	}

	setupCustomCollisionResponses(globalX, globalY) {
		CollisionManager.clearStructCollision(globalX, globalY);
		CollisionManager.addTransfer(globalX, globalY, {
			id: 7, x: 17, y: 1, dir: 8, fadeType: 0
		});
	}
}

class Struct_CaveEntrance_RedOrb extends Struct_CaveEntrance {
	constructor(id) {
		super(id, "OrbCave_Grass_Front", "OrbCave_Grass_Back");
	}

	setupCustomCollisionResponses(globalX, globalY) {
		CollisionManager.clearStructCollision(globalX, globalY);
		CollisionManager.addTransfer(globalX, globalY, {
			id: 8, x: 14, y: 22, dir: 2, fadeType: 0
		});
	}
}

class Struct_CaveEntrance_GreenOrb extends Struct_CaveEntrance {
	constructor(id) {
		super(id, "OrbCave_Grass_Front", "OrbCave_Grass_Back");
	}

	setupCustomCollisionResponses(globalX, globalY) {
		CollisionManager.clearStructCollision(globalX, globalY);
		CollisionManager.addTransfer(globalX, globalY, {
			id: 9, x: 13, y: 25, dir: 2, fadeType: 0
		});
	}
}

class Struct_CaveEntrance_BlueOrb extends Struct_CaveEntrance {
	constructor(id) {
		super(id, "OrbCave_Grass_Front", "OrbCave_Grass_Back");
	}

	setupCustomCollisionResponses(globalX, globalY) {
		CollisionManager.clearStructCollision(globalX, globalY);
		CollisionManager.addTransfer(globalX, globalY, {
			id: 10, x: 12, y: 30, dir: 2, fadeType: 0
		});
	}
}

class Struct_CaveEntrance_FastTravel extends Struct_CaveEntrance {
	constructor(id) {
		super(id, "FastTravel_Front", "FastTravel_Back");
	}

	size() {
		return [-1, -2, 3, 3];
	}

	clearSize() {
		return [-3, -3, 7, 7];
	}

	setupCustomCollisionResponses(globalX, globalY) {
		CollisionManager.clearStructCollision(globalX, globalY);
		CollisionManager.addTransfer(globalX, globalY, {
			id: 13, x: 13, y: 19, dir: 2, fadeType: 0
		});
	}
}

class Struct_CaveEntrance_HealBuilding extends Struct_CaveEntrance {
	constructor(id) {
		super(id, "HealBuilding_Front", "HealBuilding_Back");
	}

	clearSize() {
		return [-3, -3, 7, 7];
	}

	setupCustomCollisionResponses(globalX, globalY) {
		CollisionManager.clearStructCollision(globalX, globalY);
		CollisionManager.addTransfer(globalX, globalY, {
			id: 31, x: 14, y: 19, dir: 2, fadeType: 0
		});
	}
}

class Struct_CaveEntrance_GambleBuilding extends Struct_CaveEntrance {
	constructor(id) {
		super(id, "GambleBuilding_Front", "GambleBuilding_Back");
	}

	clearSize() {
		return [-3, -3, 7, 7];
	}

	setupCustomCollisionResponses(globalX, globalY) {
		CollisionManager.clearStructCollision(globalX, globalY);
		CollisionManager.addTransfer(globalX, globalY, {
			id: 32, x: 14, y: 19, dir: 2, fadeType: 0
		});
	}
}

class Struct_CaveEntrance_RandomChallenge extends Struct_CaveEntrance {
	constructor(id) {
		super(id, "RandomChallenge_Front", "RandomChallenge_Back");
		/*
			Struct_CaveEntrance_RandomChallenge.randomlyGet(
				
			),
			Struct_CaveEntrance_RandomChallenge.randomlyGet(
				"RandomChallenge_Back",
				"RandomChallenge2_Back",
				"RandomChallenge3_Back"
			)
		);*/
	}

	clearArea(globalTileX, globalTileY) {
		//const globalTileXPos = globalTileX + (GenerationManager.OFFSET_X * GenerationManager.TILES_X);
		//const globalTileYPos = globalTileY + (GenerationManager.OFFSET_Y * GenerationManager.TILES_Y);

		const globalIndex = (globalTileY * GenerationManager.GLOBAL_WIDTH) + globalTileX;
		const type = $generation.getRandomNumber(globalIndex) < 0.5 ? true : false;

		const s = this.clearSize();
		const xStart = s[0];
		const yStart = s[1];
		const width = xStart + s[2];
		const height = yStart + s[3];
		for(let x = xStart; x < width; x++) {
			for(let y = yStart; y < height; y++) {
				if(x > -3 && x < 3) {
					if(type) {
						$generation.setPlatformTile(globalTileX + x, globalTileY + y);
					} else {
						$generation.setAltCarpetTile(globalTileX + x, globalTileY + y);
					}
				} else {
					$generation.clearTile(globalTileX + x, globalTileY + y);
				}
				
			}
		}
	}

	size() {
		return [-1, -2, 3, 3];
	}

	clearSize() {
		return [-3, -3, 7, 5];
	}

	spawn(chunk, localTileX, localTileY) {
		const width2 = (GenerationManager.GLOBAL_WIDTH / 2);
		const height2 = (GenerationManager.GLOBAL_HEIGHT / 2);
		const globalX = (chunk.chunkX * GenerationManager.TILES_X) + localTileX + width2;
		const globalY = (chunk.chunkY * GenerationManager.TILES_Y) + localTileY + height2;

		const result = this.setupCustomCollisionResponses(globalX, globalY);

		if(result === true) {
			return null;
		}

		const s = this.size();
		const xStart = s[0];
		const yStart = s[1];
		const width = xStart + s[2];
		const height = yStart + s[3];
		for(let x = xStart; x < width; x++) {
			for(let y = yStart; y < height; y++) {
				CollisionManager.registerStructCollision(globalX + x, globalY + y);
			}
		}

		CollisionManager.clearStructCollision(globalX, globalY);
		CollisionManager.clearStructCollision(globalX, globalY - 1);


		const globalIndex = (globalY * GenerationManager.GLOBAL_WIDTH) + globalX;

		const key = "RC_" + globalX + "_" + globalY;

		const fronts = $keyVars.getData(key) ? 
		[
			"RandomChallengeComplete_Front",
			"RandomChallengeComplete2_Front",
			"RandomChallengeComplete3_Front"
		]
		:
		[
			"RandomChallenge_Front",
			"RandomChallenge2_Front",
			"RandomChallenge3_Front"
		];

		const backs = [
			"RandomChallenge_Back",
			"RandomChallenge2_Back",
			"RandomChallenge3_Back"
		];

		const front = fronts[Math.floor($generation.getRandomNumber(globalIndex) * fronts.length)];
		const back = backs[Math.floor($generation.getRandomNumber(globalIndex) * backs.length)];

		return new StructEntity(chunk, localTileX, localTileY, front, back, this.backOffset());
	}

	static randomlyGet() {
		return arguments[Math.floor(arguments.length * Math.random())];
	}

	getValidMapIds() {
		let usedRc = $keyVars.getData("Used_RC");
		if(!usedRc) {
			usedRc = [];
			$keyVars.setData("Used_RC", usedRc);
		}

		const result = [
			[17, 15, 34],
			[16, 17, 25],
			[18, 17, 35],

			[21, 15, 34],
			[22, 13, 44],
			[23, 13, 44],

			[24, 17, 55],
			[25, 17, 25],
			[26, 27, 41],
			[27, 19, 64],

			[28, 17, 32], // 10
			[29, 17, 32], // 11
		];


		return result;
	}

	setupCustomCollisionResponses(globalX, globalY) {
		let usedRc = $keyVars.getData("Used_RC");
		if(!usedRc) {
			usedRc = [];
			$keyVars.setData("Used_RC", usedRc);
		}

		const validMapIds = this.getValidMapIds();

		const noneLeft = usedRc.length >= validMapIds.length;
		const key = "RC_" + globalX + "_" + globalY;

		let locData = $keyVars.getData(key);

		if(!Array.isArray(locData) && noneLeft) {
			this.imgFront = Struct_CaveEntrance_RandomChallenge.randomlyGet(
				"RandomChallengeLocked_Front",
				"RandomChallengeLocked2_Front",
				"RandomChallengeLocked3_Front"
			);

			return true;
		} else {
			CollisionManager.clearStructCollision(globalX, globalY);
			CollisionManager.clearStructCollision(globalX, globalY - 1);
			CollisionManager.addCallbackTrigger(globalX, globalY - 1, function() {

				if(!$keyVars.getData(key)) {
					if(usedRc.length >= validMapIds.length) {
					} else {
						let allowedIds = [];
						for(let i = 0; i < validMapIds.length; i++) {
							if(!usedRc.contains(i)) {

								if(i >= 3 || i <= 5) {
									if(i === 3 && !usedRc.contains(0)) {
										continue;
									} else if(i > 3 && !usedRc.contains(i - 1)) {
										continue;
									}
								} else if(i >= 10 && i <= 12) {
									if(i === 10 && !usedRc.contains(2)) {
										continue;
									} else if(i > 10 && !usedRc.contains(i - 1)) {
										continue;
									}
								}

								allowedIds.push(i);
							}
						}

						if(allowedIds.length > 0) {
							let id = allowedIds[Math.floor(Math.random() * allowedIds.length)];

							usedRc.push(id);
							$keyVars.setData(key, validMapIds[id]);
						}
					}
				}

				locData = $keyVars.getData(key);

				if(locData) {
					playSe("TransferInside", 30);
					$gamePlayer.reserveTransfer(locData[0], locData[1], locData[2], 2, 0);
					$gamePlayer._setPPPlayerPos = true;
				}
			});
		}
	}
}
