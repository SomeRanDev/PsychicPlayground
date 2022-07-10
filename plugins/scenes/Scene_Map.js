modify_Scene_Map = class {
	createMenuButton() {}
	processMapTouch() {}
	onMapTouch() {}
	isMenuCalled() { return false; }

	initialize() {
		PP.Scene_Map.initialize.apply(this, arguments);
		this._isPaused = false;
		this._pauseType = 0;

		this._chunks = [];
		this._freeChunks = [];
		this._chunkExists = {};

		this._targetCameraX = null;
		this._targetCameraY = null;
	}

	updateChildren() {
		if(!this._isPaused) {
			PP.Scene_Map.updateChildren.apply(this, arguments);
		}
	}

	updateMain() {
		PP.Time += PP.WS;
		{
			if(!this._isPaused) {
				PP.Scene_Map.updateMain.apply(this, arguments);
				this.updatePPPlayer();
				this.updatePauseInput();
			} else {
				this.updateCameraPos();
				this._spriteset.updateUiOnly();
				switch(this._pauseType) {
					case 0: { this.updateMenuPause(); break; }
					case 1: { this.updateMapPause(); break; }
					case 2: { this.updateExitPause(); break; }
				}
			}
			this.updateBackgroundDarken();
		}
	}

	updatePauseInput() {
		if(Input.isTriggeredEx("e")) {
			this.setPaused(true, 0);
			$gameMap.CameraOffsetY = 60;
		} else if(Input.isTriggeredEx("m")) {
			this.setPaused(true, 1);
		} else if(Input.isTriggeredEx("esc")) {
			this.setPaused(true, 2);
		}
	}

	setPaused(p, type) {
		this._isPaused = p;
		$gameMap.IsPaused = p;

		this._pauseType = type;
		$gameMap.PauseMode = p ? type : -1;

		if(p) {
			SpriteManager.onPause();
		} else {
			SpriteManager.onUnpause();
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
		const result = ((this._targetCameraX ?? $ppPlayer.cameraX()) * this._spriteset._tilemap.scale.x) - (Graphics.width / 2) + $gameMap.CameraOffsetX;
		return result.clamp(this.minCameraX(), this.maxCameraX());
	}

	genCameraPosY() {
		const result = ((this._targetCameraY ?? $ppPlayer.cameraY()) * this._spriteset._tilemap.scale.y) - (Graphics.height / 2) + $gameMap.CameraOffsetY;
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

	// Based on:
	// https://stackoverflow.com/a/55666538/8623874
	calcStraightLine(startCoordinates, endCoordinates) {
		const coordinatesArray = [];

		let x1 = startCoordinates[0];
		let y1 = startCoordinates[1];
		const x2 = endCoordinates[0];
		const y2 = endCoordinates[1];

		const dx = Math.abs(x2 - x1);
		const dy = Math.abs(y2 - y1);
		const sx = (x1 < x2) ? 1 : -1;
		const sy = (y1 < y2) ? 1 : -1;
		let err = dx - dy;

		coordinatesArray.push([x1, y1]);

		while (!((x1 == x2) && (y1 == y2))) {
			const e2 = err << 1;
			if (e2 > -dy) {
				err -= dy;
				x1 += sx;
			}
			if (e2 < dx) {
				err += dx;
				y1 += sy;
			}
			coordinatesArray.push([x1, y1]);
		}
		return coordinatesArray;
	}

	updateMouseMovement() {
		const touchPos = new Point(TouchInput.x, TouchInput.y);
		const localPos = this._spriteset._tilemap.worldTransform.applyInverse(touchPos);

		TouchInput.worldX = localPos.x;
		TouchInput.worldY = localPos.y;

		const cx = Math.floor(localPos.x / GenerationManager.CHUNK_SIZE_X);
		const cy = Math.floor(localPos.y / GenerationManager.CHUNK_SIZE_Y);

		if($ppPlayer.showMapCursor()) {
			this.updateBuildLine(localPos, cx, cy);
		} else if(this._isRightClickHeld) {
			this.onBuildCanceled();
		}
	}

	updateBuildLine(localPos, cx, cy) {
		if(!this._isRightClickHeld && TouchInput.isCancelled()) {
			this.onBuildStart();
		} else if(this._isRightClickHeld && (TouchInput.isCancelReleased() || !TouchInput.mouseInside)) {
			this.onBuildEnd();
		}

		if(this._isRightClickHeld) {
			const chunk = this._chunkExists[this.getChunkKey(cx, cy)];
			if(chunk !== null) {
				const tileX = Math.floor((localPos.x - (cx * GenerationManager.CHUNK_SIZE_X)) / GenerationManager.TILE_WIDTH);
				const tileY = Math.floor((localPos.y - (cy * GenerationManager.CHUNK_SIZE_Y)) / GenerationManager.TILE_HEIGHT);

				const globalTileX = (cx * GenerationManager.TILES_X) + tileX;
				const globalTileY = (cy * GenerationManager.TILES_Y) + tileY;

				if(!this._firstRightClickPos) {
					this._firstRightClickPos = [globalTileX, globalTileY];
				} else {
					for(const point of this._rightClickGuides) {
						point.visible = false;
					}

					const points = this.calcStraightLine(this._firstRightClickPos, [globalTileX, globalTileY]);
					for(let i = 0; i < points.length; i++) {
						if(this._rightClickGuides.length <= i) {
							const spr = new Sprite(ImageManager.loadPicture("MouseCursor"));
							spr.z = -10;
							spr.visible = true;
							this._spriteset._mapCursorContainer.addChild(spr);
							this._rightClickGuides.push(spr);
						}
						this._rightClickGuides[i].alpha = i < this._maxBuildAmount ? 1 : 0.25;
						this._rightClickGuides[i].move(points[i][0] * 32, points[i][1] * 32);
						this._rightClickGuides[i].visible = true;
					}
					this._rightClickPoints = points;
				}
			}
		}
	}

	onBuildStart() {
		this._isRightClickHeld = true;
		this._rightClickPoints = [];
		this._rightClickGuides = [];
		this._firstRightClickPos = null;

		this._maxBuildAmount = $ppPlayer.maxBuildAmount();
	}

	onBuildEnd() {
		const len = Math.min(this._rightClickPoints.length, this._maxBuildAmount);
		let count = 0;
		for(let i = 0; i < len; i++) {
			const point = this._rightClickPoints[i];
			if(this._onRightClickRelease(point[0], point[1])) {
				count++;
			}
		}
		$ppPlayer.inventory.onBuild(count);
		this.onBuildCanceled();
		SpriteManager.sort();
	}

	onBuildCanceled() {
		for(const point of this._rightClickGuides) {
			this._spriteset._mapCursorContainer.removeChild(point);
			point.bitmap = null;
			point.destroy();
		}

		this._isRightClickHeld = false;
		this._rightClickPoints = null;
		this._rightClickGuides = null;
		this._firstRightClickPos = null;
	}

	_onRightClickRelease(globalTileX, globalTileY) {
		const cx = Math.floor(globalTileX / GenerationManager.TILES_X);
		const cy = Math.floor(globalTileY / GenerationManager.TILES_Y);
		const chunk = this._chunkExists[this.getChunkKey(cx, cy)];
		if(chunk) {
			return chunk.onMouseRightClick(globalTileX - (cx * GenerationManager.TILES_X), globalTileY - (cy * GenerationManager.TILES_Y));
		}
		return false;
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
			$ppPlayer.enableTileCursorPlacement(false);
		} else {
			this._spriteset._mapCursor.visible = TouchInput.mouseInside && $ppPlayer.showMapCursor();
			this._spriteset._mapCursor.setEnabled($ppPlayer.showEnabledCursor());
			$ppPlayer.enableTileCursorPlacement(TouchInput.mouseInside);
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

	updateBackgroundDarken() {
		SpriteManager.darken.move(this.PPCameraX + (Graphics.width / 2), this.PPCameraY + (Graphics.height / 2));
		if(this._isPaused) {
			if(SpriteManager.darken.alpha < 0.3) {
				SpriteManager.darken.alpha += 0.02;
				if(SpriteManager.darken.alpha > 0.3) {
					SpriteManager.darken.alpha = 0.3;
				}
			}
		} else {
			if(SpriteManager.darken.alpha > 0) {
				SpriteManager.darken.alpha -= 0.02;
				if(SpriteManager.darken.alpha < 0) {
					SpriteManager.darken.alpha = 0;
				}
			}
		}
	}

	updateMenuPause() {
		if(Input.isTriggeredEx("e")) {
			this.setPaused(false);
			$gameMap.CameraOffsetY = 0;
		}
	}

	updateMapPause() {
		if(Input.isTriggeredEx("m")) {
			this.setPaused(false);
		}
	}

	updateExitPause() {
		if(Input.isTriggeredEx("esc")) {
			this.setPaused(false);
		}
	}

	spawnBlock(mineableId, globalTileX, globalTileY) {
		const chunkX = Math.floor(globalTileX / GenerationManager.TILES_X);
		const chunkY = Math.floor(globalTileY / GenerationManager.TILES_Y);
		const id = this.getChunkKey(chunkX, chunkY);
		const chunk = this._chunkExists[id];
		if(chunk) {
			chunk.addBlock(mineableId, globalTileX, globalTileY);
		}
	}
}