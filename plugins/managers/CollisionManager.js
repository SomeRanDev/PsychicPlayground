class CollisionManager {
	static collisions = new Uint8Array(GenerationManager.MaxTiles);

	static registerCollision(globalX, globalY) {
		const globalIndex = GenerationManager.globalCoordsToIndex(globalX, globalY);
		this.collisions[globalIndex] = 1;
	}

	static clearCollision(globalX, globalY) {
		const globalIndex = GenerationManager.globalCoordsToIndex(globalX, globalY);
		this.collisions[globalIndex] = 0;
	}

	static canMoveTo(globalPixelX, globalPixelY) {
		const globalX = Math.floor(Math.round(globalPixelX) / GenerationManager.TILE_WIDTH);
		const globalY = Math.floor(Math.round(globalPixelY) / GenerationManager.TILE_HEIGHT);
		const width2 = (GenerationManager.GLOBAL_WIDTH / 2);
		const height2 = (GenerationManager.GLOBAL_HEIGHT / 2);
		const globalIndex = GenerationManager.globalCoordsToIndex(globalX + width2, globalY + height2);
		return this.collisions[globalIndex] === 0;
	}

	static processMovementX(currentX, currentY, shiftX) {
		currentX = Math.floor(currentX);
		currentY = Math.floor(currentY);

		if(this.canMoveTo(currentX + shiftX, currentY)) {
			return currentX + shiftX;
		}
		if(shiftX > 0) {
			for(let i = currentX + shiftX - 1; i >= currentX + 1; i--) {
				if(this.canMoveTo(i, currentY)) {
					return i;
				}
			}
		} else if(shiftX < 0) {
			for(let i = currentX + shiftX + 1; i <= currentX - 1; i++) {
				if(this.canMoveTo(i, currentY)) {
					return i;
				}
			}
		}
		return currentX;
	}

	static processMovementY(currentX, currentY, shiftY) {
		currentX = Math.floor(currentX);
		currentY = Math.floor(currentY);

		if(this.canMoveTo(currentX, currentY + shiftY)) {
			return currentY + shiftY;
		}
		if(shiftY > 0) {
			for(let i = currentY + shiftY - 1; i >= currentY + 1; i--) {
				if(this.canMoveTo(currentX, i)) {
					return i;
				}
			}
		} else if(shiftY < 0) {
			for(let i = currentY + shiftY + 1; i <= currentY - 1; i++) {
				if(this.canMoveTo(currentX, i)) {
					return i;
				}
			}
		}
		return currentY;
	}
}