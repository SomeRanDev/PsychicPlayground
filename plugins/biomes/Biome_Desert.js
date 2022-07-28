class Biome_Desert extends Biome_Base {
	constructor() {
		super();
		this.name = "Desert";
	}

	getUpperType(globalX, globalY, globalIndex, low, mid, block, total) {
		if(this.generatePath(globalX, globalY, globalIndex)) {
			return 220;
		}

		if(block !== 255) {
			return 255;
		}

		globalX *= 80;
		globalY *= 80;

		if(GenerationManager.getPerlinNoise(globalX + 2000, globalY + 2000, globalIndex) >= 0.6) {
			return 217;
		}

		if(GenerationManager.getPerlinNoise(globalX - 3000, globalY - 3000, globalIndex) >= 0.6) {
			return 218;
		}

		if(GenerationManager.getPerlinNoise(globalX + 1000, globalY + 1000, globalIndex) >= 0.8) {
			return 219;
		}

		return 255;
	}

	getMiddleType(globalX, globalY, globalIndex) {
		return 255;
	}

	getLowerType(globalX, globalY, globalIndex) {
		return 200;
	}

	getBlockType(globalX, globalY, globalIndex) {
		if(this.checkPath(globalX, globalY)) {
			return 255;
		}
		if(GenerationManager.getPerlinNoise((globalX * 20) + 2000, (globalY * 20) + 2000, globalIndex) >= 0.4) {
			return 0;
		}
		return 255;
	}
}
