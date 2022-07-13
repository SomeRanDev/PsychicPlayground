modify_Game_Map = class {
	initialize() {
		PP.Game_Map.initialize.apply(this, arguments);
		this.CameraOffsetX = 0;
		this.CameraOffsetY = 0;
		this.IsPaused = false;
		this.PauseMode = -1;
	}

	maxCameraX() {
		return 9999;
	}

	maxCameraY() {
		return 9999;
	}

	isInvPause() {
		return this.PauseMode === 0;
	}

	isMapPause() {
		return this.PauseMode === 1;
	}

	isExitPause() {
		return this.PauseMode === 2;
	}

	spawnBlock(mineableId, globalTileX, globalTileY) {
		if(SceneManager?._scene?.spawnBlock) {
			SceneManager._scene.spawnBlock(mineableId, globalTileX, globalTileY);
		}
	}

	isGenerated() {
		return !!($dataMap?.meta?.Generated);
	}
}