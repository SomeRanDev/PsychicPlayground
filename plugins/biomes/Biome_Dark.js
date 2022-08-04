class Biome_Dark extends Biome_Base {
		constructor() {
		super();
		this.name = "Darkland";
		this.plainDarkId = (255 << 24) | (30 << 8) | 203;
	}

	getUpperType(globalX, globalY, globalIndex, low, mid, block, total) {
		if(this.generatePath(globalX, globalY, globalIndex)) {
			return 220;
		}

		if(total !== this.plainDarkId) {
			return 255;
		}

		if(GenerationManager.getPerlinNoise((globalX * 80) + 2000, (globalY * 80) + 2000, globalIndex) >= 0.6) {
			return 225;
		}

		if(GenerationManager.getPerlinNoise((globalX * 80) - 3000, (globalY * 80) - 3000, globalIndex) >= 0.6) {
			return 226;
		}

		return 255;
	}

	getMiddleType(globalX, globalY, globalIndex) {
		if(GenerationManager.getPerlinNoise(globalX * 20, globalY * 20, globalIndex) < 0.55) {
			return 2;
		}

		return 255;
	}

	getLowerType(globalX, globalY, globalIndex) {
		return 203;
	}

	getBlockType(globalX, globalY, globalIndex, low, mid, total) {
		if(this.checkPath(globalX, globalY)) {
			return 255;
		}

		if(mid !== (26 + 4)) {
			return 255;
		}

		if(globalIndex % 2 !== globalY % 2) {
			return 255;
		}

		if(GenerationManager.getPerlinNoise((globalX * 80) + 3000, (globalY * 80) + 3000, globalIndex) >= 0.6) {
			return 2;
		}

		return 255;
	}
}
