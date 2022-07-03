Game_Player.prototype.triggerTouchActionD1 = function(x1, y1) {
	return $gameMap.setupStartingEvent();
}

Game_Player.prototype.triggerTouchActionD2 = function(x2, y2) {
		return $gameMap.setupStartingEvent();
}

Game_Player.prototype.update = function() {
}

SceneManager.isGameActive = function() {
	return true;
}