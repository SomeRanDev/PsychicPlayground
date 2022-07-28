
var $ppPlayer = null;

DataManager.__old_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
	DataManager.__old_createGameObjects.apply(this, arguments);
	$ppPlayer = new Player();
	$keyVars = new Game_StringVariables();
};

DataManager.__old_makeSavefileInfo = DataManager.makeSavefileInfo;
DataManager.makeSavefileInfo = function() {
	const info = DataManager.__old_makeSavefileInfo.apply(this, arguments);

	/*$gameVariables.setValue(1, this._worldSettings.name);
		$gameVariables.setValue(2, this._worldSettings.seed);
		$gameVariables.setValue(3, this._playerSettings.playerName);
		$gameVariables.setValue(4, this._playerSettings.playerClass);*/

	info.worldName = $gameVariables.value(1);
	info.worldSeed = $gameVariables.value(2);
	info.playerName = $gameVariables.value(3);
	info.playerClass = $gameVariables.value(4);

	if($ppPlayer.inventory.hasActiveSkill(2)) {
		info.geokinesisLevel = 3;
	} else if($ppPlayer.inventory.hasActiveSkill(1)) {
		info.geokinesisLevel = 2;
	} else if($ppPlayer.inventory.hasActiveSkill(0)) {
		info.geokinesisLevel = 1;
	} else {
		info.geokinesisLevel = 0;
	}

	return info;
};

DataManager.saveGame = async function(savefileId) {
	await StorageManager.saveObject(this.makeWorldSavename(savefileId), $generation.save());

	const contents = this.makeSaveContents();
	const saveName = this.makeSavename(savefileId);
	return StorageManager.saveObject(saveName, contents).then(() => {
		this._globalInfo[savefileId] = this.makeSavefileInfo();
		this.saveGlobalInfo();
		return 0;
	});
};

DataManager.loadGame = async function(savefileId) {
	const worldData = await StorageManager.loadObject(this.makeWorldSavename(savefileId));
	$generation.load(worldData);

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
	contents.keyVars = $keyVars.save();
	return contents;
};

DataManager.__old_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
	DataManager.__old_extractSaveContents.apply(this, arguments);
	if(!$ppPlayer) {
		$ppPlayer = new Player();
	}
	$ppPlayer.loadData(contents.ppplayer);

	if(!$keyVars) {
		$keyVars = new Game_StringVariables();
	}
	$keyVars.load(contents.keyVars);
};
