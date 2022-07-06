class Biome_Forest extends Biome_Base {
	getUpperType(globalX, globalY, globalIndex) {
		if(this.generatePath(globalX, globalY, globalIndex)) {
			return 220;
		}
		return 255;
	}

	getMiddleType(globalX, globalY, globalIndex) {
		if(GenerationManager.getPerlinNoise(globalX * 20, globalY * 20, globalIndex) < 0.7) {
			return 0;
		}
		return 255;
	}

	getLowerType(globalX, globalY, globalIndex) {
		return 200;
	}

	getBlockType(globalX, globalY, globalIndex, low, mid, total) {
		if(this.checkPath(globalX, globalY)) {
			return 255;
		}

		if(mid !== 4) {
			return 255;
		}

		if(globalIndex % 2 !== globalY % 2) {
			return 255;
		}

		if(GenerationManager.getPerlinNoise((globalX * 80) + 3000, (globalY * 80) + 3000, globalIndex) >= 0.2) {
			return 1;
		}

		return 255;
	}
}
