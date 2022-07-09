
var $ppPlayer = null;

DataManager.__old_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
	DataManager.__old_createGameObjects.apply(this, arguments);
	$ppPlayer = new Player();
};
