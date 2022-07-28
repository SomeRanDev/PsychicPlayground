class Biome_Dark_Lake extends Biome_Base {
	constructor() {
		super();
		this.name = "Lava Lake";
	}

	getUpperType(globalX, globalY, globalIndex) {
		return 255;
	}

	getMiddleType(globalX, globalY, globalIndex) {
		return 255;
	}

	getLowerType(globalX, globalY, globalIndex) {
		return 203;
	}

	getBlockType(globalX, globalY, globalIndex, low, mid, total) {
		return 255;
	}
}
