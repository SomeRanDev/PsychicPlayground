class Biome_Base {
	constructor() {
		this.plainGrassId = (255 << 24) | (4 << 8) | 200;
	}

	checkPath(globalX, globalY) {
		return $generation.GetPathAt(globalX, globalY);
	}

	generatePath(globalX, globalY, globalIndex) {
		if(this.checkPath(globalX, globalY)) {
			if(GenerationManager.getPerlinNoise(globalX * 80, globalY * 80, globalIndex) < 0) {
				return true;
			}
		}
		return false;
	}

	getBlockType(globalX, globalY, globalIndex, low, mid, total) {
		if(this.checkPath(globalX, globalY)) {
			return 255;
		}

		if(mid !== 4) {
			return 255;
		}

		if(GenerationManager.getPerlinNoise((globalX * 20) + 2000, (globalY * 20) + 2000, globalIndex) >= 0.7) {
			return 0;
		}

		if(GenerationManager.getPerlinNoise((globalX * 80) + 3000, (globalY * 80) + 3000, globalIndex) >= 0.7) {
			return 1;
		}

		return 255;
	}

	getUpperType(globalX, globalY, globalIndex, low, mid, block, total) {
		if(this.generatePath(globalX, globalY, globalIndex)) {
			return 220;
		}

		if(total !== this.plainGrassId) {
			return 255;
		}

		globalX *= 20;
		globalY *= 20;

		if(GenerationManager.getPerlinNoise(globalX + 2000, globalY + 2000, globalIndex) >= 0.4) {
			return 212;
		}

		if(GenerationManager.getPerlinNoise(globalX - 3000, globalY - 3000, globalIndex) >= 0.6) {
			return 210;
		}
		if(GenerationManager.getPerlinNoise(globalX + 1000, globalY + 1000, globalIndex) >= 0.6) {
			return 211;
		}
		return 255;
	}

	getMiddleType(globalX, globalY, globalIndex) {
		if(this.checkPath(globalX, globalY)) {
			return 0;
		}
		if(GenerationManager.getPerlinNoise(globalX * 20, globalY * 20, globalIndex) < 0.6) {
			return 0;
		}
		return 255;
	}

	getLowerType(globalX, globalY, globalIndex) {
		return 200;
	}
}
