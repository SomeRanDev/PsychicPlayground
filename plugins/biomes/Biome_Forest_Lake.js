class Biome_Forest_Lake extends Biome_Base {
		constructor() {
		super();
		this.name = "Lake";
	}

	getUpperType(globalX, globalY, globalIndex) {
		return 255;
	}

	getMiddleType(globalX, globalY, globalIndex) {
		return 255;
	}

	getLowerType(globalX, globalY, globalIndex) {
		return 201;
	}

	getBlockType(globalX, globalY, globalIndex, low, mid, total) {
		return 255;
	}
}
