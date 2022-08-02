class Struct_NPC extends Struct_Base {
	constructor(id, imgPath, frameCount, animationSpeed, commonEvent, offsetHalfX = false) {
		super(id);

		this.imgPath = imgPath;
		this.frameCount = frameCount;
		this.animationSpeed = animationSpeed;
		this.commonEvent = commonEvent;

		this.offsetHalfX = offsetHalfX;
	}

	addToData(globalTileX, globalTileY) {
		this.clearArea(globalTileX, globalTileY);
		$generation.addStructToData(this, globalTileX, globalTileY);
	}

	clearArea(globalTileX, globalTileY) {
		const s = [0, 0, 1, 1];
		const xStart = s[0];
		const yStart = s[1];
		const width = xStart + s[2];
		const height = yStart + s[3];
		for(let x = xStart; x < width; x++) {
			for(let y = yStart; y < height; y++) {
				$generation.clearTile(globalTileX + x, globalTileY + y);
			}
		}
	}

	spawn(chunk, localTileX, localTileY) {
		const width2 = (GenerationManager.GLOBAL_WIDTH / 2);
		const height2 = (GenerationManager.GLOBAL_HEIGHT / 2);
		const globalX = (chunk.chunkX * GenerationManager.TILES_X) + localTileX;
		const globalY = (chunk.chunkY * GenerationManager.TILES_Y) + localTileY;

		const name = "NPC_" + chunk.chunkX + "_" + chunk.chunkY + "_" + localTileX + "_" + localTileY;
		const i = new Interactable(globalX, globalY, {
			_realX: globalX,
			_realY: globalY
		}, this.imgPath, this.frameCount, this.animationSpeed, this.commonEvent);

		i._name = name;
		$gameTemp.updateEntities.push(i);
		$gameTemp.updateEntityNames[i._name] = i;

		return new StructEntity_NPC(i, name, this.offsetHalfX);
	}

	imgPath() {
		return "";
	}

	backImgPath() {
		return "";
	}

	size() {
		return [0, 0, 0, 0];
	}
}

class StructEntity_NPC {
	constructor(interactable, name, offsetHalfX) {
		this.interactable = interactable;
		this.name = name;
		if(offsetHalfX) {
			this.interactable.addPosition(0.5, 0);
		}
	}

	destroy() {
		this.interactable.destroy();
		$gameTemp.updateEntities.remove(this.interactable);
		delete $gameTemp.updateEntityNames[this.name];
	}
}
