
var $ppPlayer = null;

DataManager.__old_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
	DataManager.__old_createGameObjects.apply(this, arguments);
	$ppPlayer = new Player();
};

DataManager.saveGame = async function(savefileId) {
	await StorageManager.saveObject(this.makeWorldSavename(savefileId), $generation);

	const contents = this.makeSaveContents();
	const saveName = this.makeSavename(savefileId);
	return StorageManager.saveObject(saveName, contents).then(() => {
		this._globalInfo[savefileId] = this.makeSavefileInfo();
		this.saveGlobalInfo();
		return 0;
	});
};

DataManager.loadGame = async function(savefileId) {
	$generation = await StorageManager.loadObject(this.makeWorldSavename(savefileId));

	const saveName = this.makeSavename(savefileId);
	return StorageManager.loadObject(saveName).then(contents => {
		this.createGameObjects();
		this.extractSaveContents(contents);
		this.correctDataErrors();
		return 0;
	});
};

DataManager.makeWorldSavename = function(savefileId) {
	return "file_world%1".format(savefileId);
};

DataManager.__old_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
	const contents = DataManager.__old_makeSaveContents.apply(this, arguments);
	contents.ppplayer = $ppPlayer.saveData();
	return contents;
};

DataManager.__old_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
	DataManager.__old_extractSaveContents.apply(this, arguments);
	if(!$ppPlayer) {
		$ppPlayer = new Player();
	}
	$ppPlayer.loadData(contents.ppplayer);
};
