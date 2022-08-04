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

		this._mineables = [];

		this._targetCameraX = null;
		this._targetCameraY = null;

		this.playerKilled = false;
		this.playerKilledTransition = 0;
	}

	onMapLoaded() {
		PP.Scene_Map.onMapLoaded.apply(this, arguments);
		this._isGenerated = $gameMap.isGenerated();

		$gameMap.buildEntities();

		this.updateCameraPos(true);
	}

	onTransfer() {
		PP.Scene_Map.onTransfer.apply(this, arguments);
		this.clearEverything();
	}

	terminate() {
		PP.Scene_Map.terminate.apply(this, arguments);
		this.clearEverything();
		this.normalCursor();
	}

	clearEverything() {
		for(const chunk of this._chunks) {
			chunk.onMapEnd();
		}
		for(const chunk of this._freeChunks) {
			chunk.onMapEnd();
		}

		this._chunks = [];
		this._freeChunks = [];
		this._chunkExists = {};

		$ppPlayer.destroyAllProjectiles();
		$gameMap.destroyAllEnemyProjectiles();

		$gameMap.clearUpdateEntities();

		Chunk.TextureRef = [];

		ClearAllObjectPools();

		CollisionManager.clearAll();

		SpriteManager.clear();
	}

	updateChildren() {
		if(!this._isPaused) {
			PP.Scene_Map.updateChildren.apply(this, arguments);
		}
	}

	create() {
		PP.Scene_Map.create.apply(this, arguments);

		$generation.generateAllSyncIfNotGenerated();
	}

	isReady() {
		return $generation.isReady() && PP.Scene_Map.isReady.apply(this, arguments);
	}

	start() {
		PP.Scene_Map.start.apply(this, arguments);
		SpriteManager.addEntity($ppPlayer);

		this.cursor = new Sprite(ImageManager.lCursor("Aim"));
		this.cursor.anchor.set(0.5);
		this.addChild(this.cursor);
	}

	updateMain() {
		PP.Time += PP.WS;
		{
			if(!this._isPaused) {
				this.refreshCursor();
				this.cursor.move(TouchInput.x, TouchInput.y);

				if(this.playerKilled) {

					this.updatePlayerKilled();

				} else {

					this.updatePPPlayer();
					this.updatePauseInput();
					PP.Scene_Map.updateMain.apply(this, arguments);

				}
			} else {
				if(this._pauseType === 10) {
					PP.Scene_Map.updateMain.apply(this, arguments);
					PP.Scene_Map.updateChildren.apply(this, arguments);
				}
				this.normalCursor();
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

	refreshCursor() {
		if(!TouchInput.mouseInside) {
			this.cursor.visible = false;
			return;
		}

		this.cursor.visible = true;

		let type = 0;
		const inv = $ppPlayer.inventory;
		if(inv.isMining()) {
			type = 1;
		} else if(inv.isSkill()) {
			type = 2;
		} else if(inv.isMaterial()) {
			type = 3;
		} else if(inv.isFood()) {
			type = 4;
		}

		CursorManager.hide();

		if(this._cursorType !== type) {
			this._cursorType = type;

			//CursorManager.showNormal();
			this.cursor.visible = false;
			if(this.quantityText) {
				this.quantityText.visible = false;
			}
			switch(type) {
				case 0:
					this.cursor.bitmap = ImageManager.lCursor("Basic");
					this.cursor.visible = true;
					this.cursor.anchor.set(2 / 16);
					//CursorManager.showBasic();
					break;
				case 1:
					this.cursor.bitmap = ImageManager.lCursor("Mine");
					this.cursor.visible = true;
					this.cursor.anchor.set(2 / 30);
					//CursorManager.showMine();
					break;
				case 2:
					this.cursor.bitmap = ImageManager.lCursor("Skill");
					this.cursor.visible = true;
					this.cursor.anchor.set(0.5);

					if(!this.skillCooldownBar) {
						this.skillCooldownBar = PP.makeText("", 14);
						this.skillCooldownBar.y = 28;
						this.cursor.addChild(this.skillCooldownBar);
					}
					this.updateCursorSkillBar();

					//CursorManager.showSkill();
					break;
				case 3:
					this.cursor.bitmap = ImageManager.lCursor("Aim");
					this.cursor.visible = true;
					this.cursor.anchor.set(0.5);

					if(!this.quantityText) {
						this.quantityText = PP.makeText("", 14);
						this.quantityText.y = 28;
						this.cursor.addChild(this.quantityText);
					}
					this.updateCursorQuantity();
					break;
				case 4:
					this.cursor.bitmap = ImageManager.lCursor("Food");
					this.cursor.visible = true;
					this.cursor.anchor.set(2 / 30);
					//CursorManager.showFood();
					break;
			}
		}
	}

	updateCursorQuantity() {
		if(!this.quantityText) return;
		const count = $ppPlayer.inventory.getMaterialCount();
		this.quantityText.visible = count > 0;
		this.quantityText.text = "" + count;
	}

	updateCursorSkillBar() { //getAbilityNumber
		if(!this.skillCooldownBar) return;
		const count = $ppPlayer.inventory.getSkillCount();
		this.skillCooldownBar.visible = !!count;
		this.skillCooldownBar.text = count;
	}

	normalCursor() {
		CursorManager.showNormal();
		this.cursor.visible = false;
		this._cursorType = null;
	}

	updatePauseInput() {
		if(Input.isTriggeredEx("e")) {
			this.setPaused(true, 0);
			$gameMap.CameraOffsetY = 60;
			playSe($ppPlayer.statPoints ? "InventoryOpenLevelUp" : "InventoryOpen", 200);
		} else if($ppPlayer.allowMapHud() && Input.isTriggeredEx("m")) {
			this.setPaused(true, 1);
			playSe("MapOpen", 200);
		} else if(Input.isTriggeredEx("esc")) {
			this.setPaused(true, 2);
			this._escMenu = new Scene_EscMenu(() => this.unpauseEscMenu());
			this.addChild(this._escMenu);
			playSe("EscOpen", 200);
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
		if(this._isGenerated) {
			this.updateChunks();
		} else {
			if(!$gameMap.isEventRunning()) {
				this.updateMouseMovement();
				this.updateMouseCursor();
			}
			this.updateMineableBehavior();
		}
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
			this._spriteset.setCameraPos(this.genCameraPosX(), this.genCameraPosY(), force);
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
		if(!this._isGenerated) {
			return 0;
		}
		return ((GenerationManager.CHUNKS_X - 1) / -2) * GenerationManager.CHUNK_SIZE_X;
	}

	minCameraY() {
		if(!this._isGenerated) {
			return 0;
		}
		return ((GenerationManager.CHUNKS_Y - 1) / -2) * GenerationManager.CHUNK_SIZE_Y;
	}

	maxCameraX() {
		if(!this._isGenerated) {
			return ($gameMap.width() * 32) - (Graphics.width);
		}
		return (((GenerationManager.CHUNKS_X - 1) / 2) * GenerationManager.CHUNK_SIZE_X) - Graphics.width;
	}

	maxCameraY() {
		if(!this._isGenerated) {
			return ($gameMap.height() * 32) - (Graphics.height);
		}
		return (((GenerationManager.CHUNKS_Y - 1) / 2) * GenerationManager.CHUNK_SIZE_Y) - Graphics.height;
	}

	getChunkKey(x, y) {
		return x + " - " + y;
	}

	updateChunks() {
		this.updateLoadedChunks();
		if(!$gameMap.isEventRunning()) {
			this.updateMouseMovement();
			this.updateMouseCursor();
		}
		this.updateMineableBehavior();
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
		if(count > 0) {
			playSe("Make", 10);
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
		if(!this._isGenerated) {
			return this._noGen_onMouseRightClick(globalTileX, globalTileY);
		}
		const cx = Math.floor(globalTileX / GenerationManager.TILES_X);
		const cy = Math.floor(globalTileY / GenerationManager.TILES_Y);
		const chunk = this._chunkExists[this.getChunkKey(cx, cy)];
		if(chunk) {
			return chunk.onMouseRightClick(globalTileX - (cx * GenerationManager.TILES_X), globalTileY - (cy * GenerationManager.TILES_Y));
		}
		return false;
	}

	_noGen_onMouseRightClick(globalTileX, globalTileY) {
		const matId = $ppPlayer.inventory.hasPlacableMaterial();
		if(matId !== null && CollisionManager.emptyMineablePos(globalTileX, globalTileY)) {
			const matData = MaterialTypes[matId];
			if(matData && typeof matData.mineable === "number") {
				const mineableData = MineableTypes[matData.mineable];
				return this.spawnMineable(globalTileX, globalTileY, matData.mineable, true);
			}
		}
		return false;
	}

	spawnMineable(x, y, blockId, spawnAnimation = false) {
		if(blockId === 255) {
			return true;
		}

		const blockData = MineableTypes[blockId];
		const name = Array.isArray(blockData.name) ? blockData.name[Math.floor(Math.random() * blockData.name.length)] : blockData.name;
		const block = MineableObjectPool.getObject(name);
		this._mineables.push(block);

		block.setup(this, blockId, x, y, x, y);

		if(spawnAnimation) {
			block.spawnAnimation();
		}

		return true;
	}

	removeMineable(mineable) {
		if(this._mineables.includes(mineable)) {
			MineableObjectPool.removeObject(mineable);
			this._mineables.remove(mineable);
		}
	}

	updateMouseCursor() {
		const globalTileX = Math.floor(TouchInput.worldX / GenerationManager.TILE_WIDTH);
		const globalTileY = Math.floor(TouchInput.worldY / GenerationManager.TILE_HEIGHT);

		if(this._spriteset._mapCursor) {
			this._spriteset._mapCursor.setPos(globalTileX * 32, globalTileY * 32);
		}
	}

	updateMineableBehavior() {
		const oldSelection = this._selectedObject;

		PP.selectedObjects = [];

		if(!$gameMap.isEventRunning()) {
			if(!this._isGenerated) {
				for(const m of this._mineables) {
					if(m !== null) {
						m.update();
					}
				}
			} else {
				for(const c of this._chunks) {
					if(c !== null) {
						c.update();
					}
				}
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
			let wait = 0;
			if(oldSelection) {
				wait = 1;
				oldSelection.setSelected(false);
			}
			if(finalObject) {
				this._selectedObject = finalObject;
				finalObject.setSelected(true, wait);
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
		if(SpriteManager.darken) {
			SpriteManager.darken.move(this.PPCameraX + (Graphics.width / 2), this.PPCameraY + (Graphics.height / 2));
			if(this._isPaused) {
				const finalAlpha = this._pauseType === 0 ? 0.3 : 0.5;
				if(SpriteManager.darken.alpha < finalAlpha) {
					SpriteManager.darken.alpha += 0.02;
					if(SpriteManager.darken.alpha > finalAlpha) {
						SpriteManager.darken.alpha = finalAlpha;
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
			playSe("MapClose", 200);
		}
	}

	updateExitPause() {
		this._escMenu.update();
		if(Input.isTriggeredEx("esc")) {
			this.unpauseEscMenu();
			playSe("EscClose", 200);
		}
	}

	unpauseEscMenu() {
		this._escMenu.destroySelf();
		this.setPaused(false);
		this._escMenu = null;
	}

	spawnBlock(mineableId, globalTileX, globalTileY) {
		if(!this._isGenerated) {
			this.spawnMineable(globalTileX, globalTileY, mineableId);
			return;
		}
		const chunkX = Math.floor(globalTileX / GenerationManager.TILES_X);
		const chunkY = Math.floor(globalTileY / GenerationManager.TILES_Y);
		const id = this.getChunkKey(chunkX, chunkY);
		const chunk = this._chunkExists[id];
		if(chunk) {
			chunk.addBlock(mineableId, globalTileX, globalTileY);
		}
	}

	onPlayerKill() {
		this.playerKilled = true;
		SpriteManager.deathDarken.move(this.PPCameraX + (Graphics.width / 2), this.PPCameraY + (Graphics.height / 2));
		SpriteManager.deathDarken.visible = true;
		SpriteManager.deathDarken.alpha = 0;
	}

	startPlayerDeathTransition() {
		this.playerKilledTransition = 100;
		SpriteManager.deathTransition.visible = true;
		SpriteManager.deathTransition.scale.set(0);
	}

	updatePlayerKilled() {
		$ppPlayer.update();

		if(SpriteManager.deathDarken.alpha < 0.5) {
			SpriteManager.deathDarken.alpha += 0.05;
		}

		if(this.playerKilledTransition > 0) {
			this.playerKilledTransition--;
			SpriteManager.deathTransition.scale.set(8 * (1 - (this.playerKilledTransition / 100).cubicOut()));
			if(this.playerKilledTransition <= 0) {
				this.completePlayerKillTransition();
			}
		}
	}

	completePlayerKillTransition() {
		// fade out music?
		// go to respawn
		$ppPlayer.gotoRespawn();
		$ppPlayer.clearDeathEffect();
		$ppPlayer.bedHealHp();
		$ppPlayer.setInvincible(128);
		$ppPlayer.destroyAllProjectiles();

		$gameMap.destroyAllEnemyProjectiles();

		if($generation.enemies) {
			while($generation.enemies.length > 0) {
				$generation.enemies[0].destroy();
			}
		}

		this.playerKilled = false;

		this.startFadeIn(180, false);

		SpriteManager.deathDarken.visible = false;
		SpriteManager.deathDarken.alpha = 0;

		this.playerKilledTransition = 0;

		SpriteManager.deathTransition.visible = false;
		SpriteManager.deathTransition.scale.set(0);
	}
}