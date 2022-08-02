class Biome_Base_Tree extends Biome_Base {
		constructor() {
		super();
		this.name = "Tree Cluster";
	}

	getUpperType(globalX, globalY, globalIndex) {
		return 255;
	}

	getMiddleType(globalX, globalY, globalIndex) {
		return 0;
	}

	getLowerType(globalX, globalY, globalIndex) {
		return 200;
	}

	getBlockType(globalX, globalY, globalIndex, low, mid, total) {
		if(this.checkPath(globalX, globalY)) {
			return 255;
		}

		if(mid !== (4)) {
			return 255;
		}

		if(globalIndex % 2 !== globalY % 2) {
			return 255;
		}

		if(GenerationManager.getPerlinNoise((globalX * 80) + 3000, (globalY * 80) + 3000, globalIndex) >= 0.4) {
			return 1;
		}

		return 255;
	}
}
