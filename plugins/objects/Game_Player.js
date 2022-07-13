modify_Game_Player = class {
	locate(x, y) {
		PP.Game_Player.locate.apply(this, arguments);

		$ppPlayer.position.x = (x * 32) + 16;
		$ppPlayer.position.y = (y * 32) + 24;

		$ppPlayer.setMZDir(this._newDirection);

		if(SceneManager._scene?.updateCameraPos) {
			SceneManager._scene.updateCameraPos();
		}
	};
}