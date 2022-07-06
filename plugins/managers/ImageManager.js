

ImageManager.IsTwitter = false;

ImageManager.lExists = function(filepath) {
	const p = require("path");
	return require("fs").existsSync(p.join(p.dirname(__filename), filepath));
};

ImageManager.loadBitmapWTwitter = function(filePath, filename) {
	if(this.IsTwitter) {
		if(this.lExists(filePath + filename + "_Twitter.png")) {
			return this.loadBitmap(filePath, filename + "_Twitter");
		} else {
			return this.loadBitmap("img/pictures/", "Blank");
		}
	}
	return this.loadBitmap(filePath, filename);
};

ImageManager.lPlayer = function(filename) {
	return this.loadBitmapWTwitter("img/player/", filename);
};

ImageManager.lGeneration = function(filename) {
	return this.loadBitmap("img/generation/", filename);
};

ImageManager.lUi = function(filename) {
	return this.loadBitmap("img/ui/", filename);
};

ImageManager.lTile = function(filename) {
	return this.loadBitmapWTwitter("img/tiles/", filename);
};

