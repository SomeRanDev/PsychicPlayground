class CollisionManager {
	static collisions = new Uint8Array(GenerationManager.MaxTiles);
	static triggers = new Uint8Array(GenerationManager.MaxTiles);
	static responseData = [];

	static CollisionType = 1;
	static MoveSuccessful = false;

	static addTransfer(globalTileX, globalTileY, transferData, left = 0, right = 0, up = 0, down = 0) {
		transferData.type = 0;
		this.responseData.push(transferData);

		const colId = this.responseData.length;

		for(let x = globalTileX - left; x <= (globalTileX + right); x++) {
			for(let y = globalTileY - up; y <= (globalTileY + down); y++) {
				const globalIndex = x + ($gameMap.width() * y);
				this.triggers[globalIndex] = colId;
			}
		}
	}

	static checkForResponse(globalTileX, globalTileY) {
		const globalIndex = globalTileX + ($gameMap.width() * globalTileY);
		if(this.triggers[globalIndex] > 0) {
			const id = this.triggers[globalIndex];
			const data = this.responseData[id - 1];
			switch(data.type) {
				case 0: {
					$gamePlayer.reserveTransfer(data.id, data.x, data.y, data.dir, 0);
					break;
				}
			}
		}
	}

	static clearAll() {
		const len = this.collisions.length;
		for(let i = 0; i < len; i++) {
			this.collisions[i] = 0;
			this.triggers[i] = 0;
		}
		this.transfers = [];
	}

	static registerMineableCollision(globalX, globalY) {
		const globalIndex = (!$gameMap.isGenerated()) ? (globalX + ($gameMap.width() * globalY)) : $generation.globalCoordsToIndex(globalX, globalY);
		this.collisions[globalIndex] = 3;
	}

	static registerSpikeCollision(globalX, globalY) {
		const globalIndex = (!$gameMap.isGenerated()) ? (globalX + ($gameMap.width() * globalY)) : $generation.globalCoordsToIndex(globalX, globalY);
		this.collisions[globalIndex] = 1;
	}

	static clearCollision(globalX, globalY) {
		const globalIndex = (!$gameMap.isGenerated()) ? (globalX + ($gameMap.width() * globalY)) : $generation.globalCoordsToIndex(globalX, globalY);
		this.collisions[globalIndex] = 0;
	}

	static setPlayerCollisionCheck() {
		this.CollisionType = 1;
	}

	static setProjectileCollisionCheck() {
		this.CollisionType = 2;
	}

	static emptyMineablePos(globalTileX, globalTileY) {
		return (this.canMoveToGlobalTile(globalTileX, globalTileY) & 1) !== 0;
	}

	static emptyMineableChunkPos(chunkX, chunkY, localTileX, localTileY) {
		this.setPlayerCollisionCheck();
		return this.canMoveToLocalTile(chunkX, chunkY, localTileX, localTileY);
	}

	static canMoveTo(globalPixelX, globalPixelY) {
		if(!$gameMap.isGenerated()) {
			const globalX = Math.floor(Math.round(globalPixelX) / GenerationManager.TILE_WIDTH);
			const globalY = Math.floor(Math.round(globalPixelY) / GenerationManager.TILE_HEIGHT);
			if(!this.canMoveToGlobalTile(globalX, globalY)) {
				return false;
			}
			const globalIndex = globalX + ($gameMap.width() * globalY);
			return (this.collisions[globalIndex] & this.CollisionType) === 0;
		}
		const globalX = Math.floor(Math.round(globalPixelX) / GenerationManager.TILE_WIDTH);
		const globalY = Math.floor(Math.round(globalPixelY) / GenerationManager.TILE_HEIGHT);
		const width2 = (GenerationManager.GLOBAL_WIDTH / 2);
		const height2 = (GenerationManager.GLOBAL_HEIGHT / 2);
		const globalIndex = $generation.globalCoordsToIndex(globalX + width2, globalY + height2);
		return (this.collisions[globalIndex] & this.CollisionType) === 0;
	}

	static canMoveToGlobalTile(globalTileX, globalTileY) {
		return ($gameMap.regionId(globalTileX, globalTileY) & this.CollisionType) !== 0;
	}

	static canMoveToLocalTile(chunkX, chunkY, localTileX, localTileY) {
		const globalX = (chunkX * GenerationManager.TILES_X) + localTileX;
		const globalY = (chunkY * GenerationManager.TILES_Y) + localTileY;
		const width2 = (GenerationManager.GLOBAL_WIDTH / 2);
		const height2 = (GenerationManager.GLOBAL_HEIGHT / 2);
		const globalIndex = $generation.globalCoordsToIndex(globalX + width2, globalY + height2);
		return (this.collisions[globalIndex] & this.CollisionType) === 0;
	}

	static processMovementX(currentX, currentY, shiftX) {
		currentX = Math.floor(currentX);
		currentY = Math.floor(currentY);

		if(this.canMoveTo(currentX + shiftX, currentY)) {
			CollisionManager.MoveSuccessful = true;
			return currentX + shiftX;
		}
		CollisionManager.MoveSuccessful = false;
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
			CollisionManager.MoveSuccessful = true;
			return currentY + shiftY;
		}
		CollisionManager.MoveSuccessful = false;
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