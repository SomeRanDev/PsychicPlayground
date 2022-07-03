modify_Scene_Map = class {
	createMenuButton() {}
	processMapTouch() {}
	onMapTouch() {}
	isMenuCalled() { return false; }

	initialize() {
		PP.Scene_Map.initialize.apply(this, arguments);
		this._isPaused = false;

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
		return -9999;
	}

	minCameraY() {
		return -9999;
	}

	maxCameraX() {
		return (9999 * TS * this._spriteset._tilemap.scale.x) - Graphics.width;
	}

	maxCameraY() {
		return (9999 * TS * this._spriteset._tilemap.scale.y) - Graphics.height;
	}

	updatePause() {
	}
}