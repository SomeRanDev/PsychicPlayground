modify_Game_Player = class {
	locate(x, y) {
		PP.Game_Player.locate.apply(this, arguments);

		if(!$ppPlayer.position || this._setPPPlayerPos) {
			$ppPlayer.position = new Vector2(0, 0);
			$ppPlayer.position.x = (x * 32) + 16;
			$ppPlayer.position.y = (y * 32) + 24;
			$ppPlayer.setRespawn((x * 32) + 16, (y * 32) + 24);
			this._setPPPlayerPos = false;
		}

		$ppPlayer.setMZDir(this._newDirection);

		if(SceneManager._scene?.updateCameraPos) {
			SceneManager._scene.updateCameraPos();
		}
	};
}