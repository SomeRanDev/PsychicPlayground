class Biome_Forest extends Biome_Base {
		constructor() {
		super();
		this.name = "Forest";
	}

	getUpperType(globalX, globalY, globalIndex) {
		if(this.generatePath(globalX, globalY, globalIndex)) {
			return 220;
		}
		return 255;
	}

/*
	_nextToEdge(globalX, globalY) {
		return $generation._getBiomeType(globalX + 1, globalY) !== 2 ||
			$generation._getBiomeType(globalX, globalY + 1) !== 2 ||
			$generation._getBiomeType(globalX - 1, globalY) !== 2 ||
			$generation._getBiomeType(globalX, globalY - 1) !== 2;
	}

	_nextToEdgeEx(globalX, globalY) {
		return this._nextToEdge(globalX + 1, globalY) ||
			this._nextToEdge(globalX, globalY + 1) ||
			this._nextToEdge(globalX - 1, globalY) ||
			this._nextToEdge(globalX, globalY - 1);
	}
*/

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
		if(this.checkPath(globalX, globalY)) {
			return 255;
		}

		if(mid !== (13 + 4)) {
			return 255;
		}

		if(globalIndex % 2 !== globalY % 2) {
			return 255;
		}

		if(GenerationManager.getPerlinNoise((globalX * 80) + 3000, (globalY * 80) + 3000, globalIndex) >= 0.2) {
			return 1;
		}

		if(GenerationManager.getPerlinNoise((globalX * 90) + 1234, (globalY * 90) + 1234, globalIndex) >= 0.6) {
			return 5;
		}

		return 255;
	}
}
