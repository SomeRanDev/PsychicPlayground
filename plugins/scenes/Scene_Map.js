modify_Scene_Map = class {
	createMenuButton() {}
	processMapTouch() {}
	onMapTouch() {}
	isMenuCalled() { return false; }

	initialize() {
		PP.Scene_Map.initialize.apply(this, arguments);
		this._isPaused = false;

		this._chunks = [];
		this._freeChunks = [];
		this._chunkExists = {};

		this._targetCameraX = null;
		this._targetCameraY = null;
	}

	updateMain() {
		PP.Time += PP.WS;
		{
			if(!this._isPaused) {
				PP.Scene_Map.updateMain.apply(this, arguments);
				this.updatePPPlayer();
			} else {
				this.updatePause();
			}
		}
	}

	updatePPPlayer() {
		$ppPlayer.update();
		this.updateCameraPos();
		this.updateChunks();
	}

	setCameraTargetXY(x, y) {
		this._targetCameraX = x;
		this._targetCameraY = y;
	}

	setCameraToPlayer() {
		this._targetCameraX = this._targetCameraY = null;
	}

	canMoveCamera() {
		return true;//!this._selectedObject || !this._selectedObject._pressed;
	}

	updateCameraPos(force = false) {
		if(this.canMoveCamera() && this._spriteset && this._spriteset.canMoveCamera()) {
			const letsForce = false;//$gameTemp._isNewGame || ($gameMap._isTranferring && !$espGamePlayer._canControl) || force || this._spriteset._tilemap.scale.x > 1;
			this._spriteset.setCameraPos(this.genCameraPosX(), this.genCameraPosY(), letsForce);
			this.PPCameraX = -this._spriteset._tilemap.x;
			this.PPCameraY = -this._spriteset._tilemap.y;
		}
	}

	isCameraAtTarget(threshold = 10) {
		return this._spriteset.isCameraAtTarget(threshold);
	}

	genCameraPosX() {
		const result = ((this._targetCameraX ?? $ppPlayer.cameraX()) * this._spriteset._tilemap.scale.x) - (Graphics.width / 2);// + $gameMap.ESPCameraOffsetX;
		return result.clamp(this.minCameraX(), this.maxCameraX());
	}

	genCameraPosY() {
		const result = ((this._targetCameraY ?? $ppPlayer.cameraY()) * this._spriteset._tilemap.scale.y) - (Graphics.height / 2);// + $gameMap.ESPCameraOffsetY;
		return result.clamp(this.minCameraY(), this.maxCameraY());
	}

	minCameraX() {
		return ((GenerationManager.CHUNKS_X - 1) / -2) * GenerationManager.CHUNK_SIZE_X;
	}

	minCameraY() {
		return ((GenerationManager.CHUNKS_Y - 1) / -2) * GenerationManager.CHUNK_SIZE_Y;
	}

	maxCameraX() {
		return (((GenerationManager.CHUNKS_X - 1) / 2) * GenerationManager.CHUNK_SIZE_X) - Graphics.width;
	}

	maxCameraY() {
		return (((GenerationManager.CHUNKS_Y - 1) / 2) * GenerationManager.CHUNK_SIZE_Y) - Graphics.height;
	}

	getChunkKey(x, y) {
		return x + " - " + y;
	}

	updateChunks() {
		this.updateLoadedChunks();
		this.updateMouseMovement();
		this.updateMouseCursor();
		this.updateChunkBehavior();
		this.updateMousePress();
	}

	updateLoadedChunks() {
		const minX = Math.floor(this.PPCameraX / GenerationManager.CHUNK_SIZE_X) - 1;
		const minY = Math.floor(this.PPCameraY / GenerationManager.CHUNK_SIZE_Y) - 1;
		const maxX = minX + 5;
		const maxY = minY + 3;

		if(this._lastMinX !== minX || this._lastMinY !== minY || this._lastMaxX !== maxX || this._lastMaxY !== maxY) {
			this._lastMinX = minX;
			this._lastMinY = minY;
			this._lastMaxX = maxX;
			this._lastMaxY = maxY;

			for(let i = 0; i < this._chunks.length; i++) {
				const c = this._chunks[i];
				if(c) {
					if(c.chunkX < minX || c.chunkX > maxX || c.chunkY < minY || c.chunkY > maxY) {
						this._chunks[i] = null;
						this._chunkExists[this.getChunkKey(c.chunkX, c.chunkY)] = null;
						this._freeChunks.push(c);
					}
				}
			}
			
			for(let x = minX; x <= maxX; x++) {
				for(let y = minY; y <= maxY; y++) {
					const key = this.getChunkKey(x, y);
					if(!this._chunkExists[key]) {
						const c = this.getChunk(x, y);
						this.addChunk(c);
						this._chunkExists[key] = c;
					}
				}
			}
		}
	}

	updateMouseMovement() {
		const touchPos = new Point(TouchInput.x, TouchInput.y);
		const localPos = this._spriteset._tilemap.worldTransform.applyInverse(touchPos);

		TouchInput.worldX = localPos.x;
		TouchInput.worldY = localPos.y;

		const cx = Math.floor(localPos.x / GenerationManager.CHUNK_SIZE_X);
		const cy = Math.floor(localPos.y / GenerationManager.CHUNK_SIZE_Y);

		if(TouchInput.isTriggered()) {
			const chunk = this._chunkExists[this.getChunkKey(cx, cy)];
			if(chunk !== null) {
				const tileX = Math.floor((localPos.x - (cx * GenerationManager.CHUNK_SIZE_X)) / GenerationManager.TILE_WIDTH);
				const tileY = Math.floor((localPos.y - (cy * GenerationManager.CHUNK_SIZE_Y)) / GenerationManager.TILE_HEIGHT);
				chunk.onMouseClick(tileX, tileY);
			}
		}
	}

	updateMouseCursor() {
		const globalTileX = Math.floor(TouchInput.worldX / GenerationManager.TILE_WIDTH);
		const globalTileY = Math.floor(TouchInput.worldY / GenerationManager.TILE_HEIGHT);

		if(this._spriteset._mapCursor) {
			this._spriteset._mapCursor.setPos(globalTileX * 32, globalTileY * 32);
		}
	}

	updateChunkBehavior() {
		const oldSelection = this._selectedObject;

		PP.selectedObjects = [];
		for(const c of this._chunks) {
			if(c !== null) {
				c.update();
			}
		}

		let finalObject = null;
		if(TouchInput.mouseInside) {
			for(const c of PP.selectedObjects) {
				if(!finalObject || (finalObject.realY < c.realY)) {
					finalObject = c;
				}
			}
		}

		if(oldSelection !== finalObject) {
			if(oldSelection) {
				oldSelection.setSelected(false);
			}
			if(finalObject) {
				this._selectedObject = finalObject;
				finalObject.setSelected(true);
			} else {
				this._selectedObject = null;
			}
		}

		if(finalObject) {
			this._spriteset._mapCursor.visible = false;
		} else {
			this._spriteset._mapCursor.visible = TouchInput.mouseInside;
		}
	}

	updateMousePress() {
		/*
		if(TouchInput.isTriggered()) {
			if(this._selectedObject) {
				this._selectedObject.setPressed(true);
			}
		} else if(TouchInput.isReleased()) {
			if(this._selectedObject) {
				this._selectedObject.setPressed(false);
			}
		}*/
	}

	addChunk(c) {
		for(let i = 0; i < this._chunks.length; i++) {
			if(this._chunks[i] === null) {
				this._chunks[i] = c;
				return;
			}
		}
		this._chunks.push(c);
	}

	getChunk(x, y) {
		if(this._freeChunks.length > 0) {
			const result = this._freeChunks.pop();
			result.setPosition(x, y);
			return result;
		}
		return new Chunk(x, y);
	}

	updatePause() {
	}
}