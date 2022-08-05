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
		this.setTriggers(colId, globalTileX, globalTileY, left, right, up, down);
	}

	static addOverworldTransfer(globalTileX, globalTileY, transferData, left = 0, right = 0, up = 0, down = 0) {
		transferData.type = 0;

		transferData.overworld = true;
		transferData.x = $ppPlayer._lastOverworldX;
		transferData.y = $ppPlayer._lastOverworldY;
		transferData.dir = 8;

		this.responseData.push(transferData);

		const colId = this.responseData.length;
		this.setTriggers(colId, globalTileX, globalTileY, left, right, up, down);
	}

	static addEventTrigger(globalTileX, globalTileY, triggerData, left = 0, right = 0, up = 0, down = 0) {
		triggerData.type = 1;
		this.responseData.push(triggerData);

		const colId = this.responseData.length;
		this.setTriggers(colId, globalTileX, globalTileY, left, right, up, down);
	}

	static addCommonEventTrigger(globalTileX, globalTileY, commonEventId, left = 0, right = 0, up = 0, down = 0) {
		const triggerData = {
			type: 2,
			commonEventId
		};
		this.responseData.push(triggerData);

		const colId = this.responseData.length;
		this.setTriggers(colId, globalTileX, globalTileY, left, right, up, down);
	}

	static addCallbackTrigger(globalTileX, globalTileY, callback, left = 0, right = 0, up = 0, down = 0) {
		const triggerData = {
			type: 3,
			callback
		};
		this.responseData.push(triggerData);

		const colId = this.responseData.length;
		this.setTriggers(colId, globalTileX, globalTileY, left, right, up, down);
	}

	static setTriggers(colId, globalTileX, globalTileY, left = 0, right = 0, up = 0, down = 0) {
		for(let x = globalTileX - left; x <= (globalTileX + right); x++) {
			for(let y = globalTileY - up; y <= (globalTileY + down); y++) {
				const globalIndex = this._getIndex(x, y);
				this.triggers[globalIndex] = colId;
			}
		}
	}

	static responseCouldExist(globalTileX, globalTileY) {
		if($gameMap.isGenerated()) {
			globalTileX += GenerationManager.OFFSET_X * GenerationManager.TILES_X;
			globalTileY += GenerationManager.OFFSET_Y * GenerationManager.TILES_Y;
		}
		const globalIndex = this._getIndex(globalTileX, globalTileY);
		return (this.triggers[globalIndex] > 0);
	}

	static checkForResponse(globalTileX, globalTileY) {
		if($gameMap.isGenerated()) {
			globalTileX += GenerationManager.OFFSET_X * GenerationManager.TILES_X;
			globalTileY += GenerationManager.OFFSET_Y * GenerationManager.TILES_Y;
		}
		const globalIndex = this._getIndex(globalTileX, globalTileY);
		if(this.triggers[globalIndex] > 0) {
			const id = this.triggers[globalIndex];
			const data = this.responseData[id - 1];
			switch(data.type) {
				case 0: {
					if(data.overworld) {
						data.x = $ppPlayer._lastOverworldX;
						data.y = $ppPlayer._lastOverworldY;
						playSe("TransferOutside", 70);
					} else {
						playSe("TransferInside", 30);
					}
					$gamePlayer.reserveTransfer(data.id, data.x, data.y, data.dir, data.fadeType);
					$gamePlayer._setPPPlayerPos = true;
					return false;
				}
				case 1: {
					if(!data.key || $keyVars.off(data.key)) {
						$gameMap._interpreter.setup(data.list);
						return false;
					}
					break;
				}
				case 2: {
					$gameTemp.reserveCommonEvent(data.commonEventId);
					return false;
				}
				case 3: {
					data.callback();
					return false;
				}
			}
		}
		return true;
	}

	static _getIndex(globalTileX, globalTileY) {
		if(!$gameMap.isGenerated()) {
			return globalTileX + ($gameMap.width() * globalTileY);
		}
		return $generation.globalCoordsToIndex(globalTileX, globalTileY);
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
		const globalIndex = this._getIndex(globalX, globalY);
		this.collisions[globalIndex] = 3;
	}

	static registerStructCollision(globalTileX, globalTileY) {
		const globalIndex = this._getIndex(globalTileX, globalTileY);
		this.collisions[globalIndex] = 7;
	}

	static registerSpikeCollision(globalX, globalY) {
		const globalIndex = this._getIndex(globalX, globalY);
		this.collisions[globalIndex] = 1;
	}

	static registerCantWalkTileCollision(globalX, globalY) {
		const globalIndex = this._getIndex(globalX, globalY);
		this.collisions[globalIndex] = 1;
	}

	static clearCollision(globalX, globalY) {
		const globalIndex = this._getIndex(globalX, globalY);
		if(this.collisions[globalIndex] < 7) {
			this.collisions[globalIndex] = 0;
		}
	}

	static clearStructCollision(globalX, globalY) {
		const globalIndex = this._getIndex(globalX, globalY);
		this.collisions[globalIndex] = 0;
	}

	static setPlayerCollisionCheck() {
		this.CollisionType = 1;
	}

	static setProjectileCollisionCheck() {
		this.CollisionType = 2;
	}

	static emptyMineablePos(globalTileX, globalTileY) {
		this.setPlayerCollisionCheck();
		return this.canMoveToGlobalTile(globalTileX, globalTileY);
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

	static canMoveToTile(globalTileX, globalTileY) {
		const width2 = (GenerationManager.GLOBAL_WIDTH / 2);
		const height2 = (GenerationManager.GLOBAL_HEIGHT / 2);
		const globalIndex = $generation.globalCoordsToIndex(globalTileX + width2, globalTileY + height2);
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
		currentX = (currentX);
		currentY = Math.floor(currentY);

		if(this.canMoveTo(Math.floor(currentX + shiftX), currentY)) {
			CollisionManager.MoveSuccessful = true;
			return currentX + shiftX;
		}
		CollisionManager.MoveSuccessful = false;
		if(shiftX > 0) {
			for(let i = currentX + shiftX - 1; i >= currentX + 1; i--) {
				if(this.canMoveTo(Math.floor(i), currentY)) {
					return i;
				}
			}
		} else if(shiftX < 0) {
			for(let i = currentX + shiftX + 1; i <= currentX - 1; i++) {
				if(this.canMoveTo(Math.floor(i), currentY)) {
					return i;
				}
			}
		}
		return currentX;
	}

	static processMovementY(currentX, currentY, shiftY) {
		currentX = Math.floor(currentX);
		currentY = (currentY);

		if(this.canMoveTo(currentX, Math.floor(currentY + shiftY))) {
			CollisionManager.MoveSuccessful = true;
			return currentY + shiftY;
		}
		CollisionManager.MoveSuccessful = false;
		if(shiftY > 0) {
			for(let i = currentY + shiftY - 1; i >= currentY + 1; i--) {
				if(this.canMoveTo(currentX, Math.floor(i))) {
					return i;
				}
			}
		} else if(shiftY < 0) {
			for(let i = currentY + shiftY + 1; i <= currentY - 1; i++) {
				if(this.canMoveTo(currentX, Math.floor(i))) {
					return i;
				}
			}
		}
		return currentY;
	}

	// alt?

	static processMovementXAlt(currentX, currentY, shiftX) {
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

	static processMovementYAlt(currentX, currentY, shiftY) {
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