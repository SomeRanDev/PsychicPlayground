if(Utils.isOptionValid("test")) {

Scene_Boot.prototype.startNormalGame = function() {
	this.checkPlayerLocation();
	DataManager.setupNewGame();
	SceneManager.goto(Scene_Title);
	//SceneManager.goto(Scene_Map);
	Window_TitleCommand.initCommandPosition();
	$gameTemp._isNewGame = false;
};


/*
Scene_Boot.prototype.startNormalGame = function() {
	this.checkPlayerLocation();
	DataManager.setupNewGame();
	SceneManager.goto(Scene_Title);
	//SceneManager.goto(Scene_WorldSetup);
	//SceneManager.goto(Scene_PlayerSetup);
	Window_TitleCommand.initCommandPosition();
	$gameTemp._isNewGame = false;
};
*/

}
