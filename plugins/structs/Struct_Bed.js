class Struct_Bed extends Struct_Base {
	constructor(id) {
		super(id);
	}

	addToData(globalTileX, globalTileY) {
		this.clearArea(globalTileX, globalTileY);
		$generation.addStructToData(this, globalTileX, globalTileY);
	}

	clearArea(globalTileX, globalTileY) {
		const s = [-3, -3, 6, 7];
		const xStart = s[0];
		const yStart = s[1];
		const width = xStart + s[2];
		const height = yStart + s[3];
		for(let x = xStart; x <= width; x++) {
			for(let y = yStart; y <= height; y++) {
				if(x === -3 || x === 3 || y === -3 || y === 4) {
					$generation.setCarpetTile(globalTileX + x, globalTileY + y);
					$generation.setCustomBlock(globalTileX + x, globalTileY + y - 1, 4, 200);
				} else {
					$generation.setCarpetTile(globalTileX + x, globalTileY + y);
				}
			}
		}
	}

	spawn(chunk, localTileX, localTileY) {
		const width2 = (GenerationManager.GLOBAL_WIDTH / 2);
		const height2 = (GenerationManager.GLOBAL_HEIGHT / 2);
		const globalX = (chunk.chunkX * GenerationManager.TILES_X) + localTileX;
		const globalY = (chunk.chunkY * GenerationManager.TILES_Y) + localTileY;

		const s = this.size();
		const xStart = s[0];
		const yStart = s[1];
		const width = xStart + s[2];
		const height = yStart + s[3];
		for(let x = xStart; x < width; x++) {
			for(let y = yStart; y < height; y++) {
				CollisionManager.registerStructCollision(globalX + width2 + x, globalY + height2 + y);
			}
		}

		const name = "Bed_" + chunk.chunkX + "_" + chunk.chunkY + "_" + localTileX + "_" + localTileY;
		const i = new Bed(globalX, globalY);

		i._name = name;
		$gameTemp.updateEntities.push(i);
		$gameTemp.updateEntityNames[i._name] = i;

		return new StructEntity_Bed(i, name);
	}

	imgPath() {
		return "";
	}

	backImgPath() {
		return "";
	}

	size() {
		return [0, 0, 1, 2];
	}
}

class StructEntity_Bed {
	constructor(interactable, name) {
		this.interactable = interactable;
		this.name = name;
		//this.interactable.addPosition(0.5, 0.5);
	}

	destroy() {
		this.interactable.destroy();
		$gameTemp.updateEntities.remove(this.interactable);
		delete $gameTemp.updateEntityNames[this.name];
	}
}
