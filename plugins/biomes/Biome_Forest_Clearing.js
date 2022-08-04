class Biome_Forest_Clearing extends Biome_Base {
		constructor() {
		super();
		this.name = "Forest Clearing";
	}

	getUpperType(globalX, globalY, globalIndex) {
		if(this.generatePath(globalX, globalY, globalIndex)) {
			return 220;
		}
		return 255;
	}

	getMiddleType(globalX, globalY, globalIndex) {
		if(GenerationManager.getPerlinNoise(globalX * 20, globalY * 20, globalIndex) < 0.6) {
			return 1;
		}
		return 255;
	}

	getLowerType(globalX, globalY, globalIndex) {
		return 202;
	}

	getBlockType(globalX, globalY, globalIndex, low, mid, total) {
		if(GenerationManager.getPerlinNoise((globalX * 90) + 1234, (globalY * 90) + 1234, globalIndex) >= 0.6) {
			return 5;
		}
		return 255;
	}
}
