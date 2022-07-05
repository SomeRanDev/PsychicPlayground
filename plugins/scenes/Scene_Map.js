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

	updateCameraPos(force = false) {
		if(this._spriteset && this._spriteset.canMoveCamera()) {
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

	updateChunks() {
		const minX = Math.floor(this.PPCameraX / GenerationManager.CHUNK_SIZE_X) - 2;
		const minY = Math.floor(this.PPCameraY / GenerationManager.CHUNK_SIZE_Y) - 2;
		const maxX = minX + 6 + 4;
		const maxY = minY + 4 + 4;

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
						this._chunkExists[c.chunkX + " - " + c.chunkY] = false;
						this._freeChunks.push(c);
					}
				}
			}
			
			for(let x = minX; x <= maxX; x++) {
				for(let y = minY; y <= maxY; y++) {
					const key = x + " - " + y;
					if(!this._chunkExists[key]) {
						this.addChunk(this.getChunk(x, y));
						this._chunkExists[key] = true;
					}
				}
			}
		}

		for(const c of this._chunks) {
			if(c !== null) c.update();
		}
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