
// special mode for posting progress on twitter without spoiling the game ahead of time
ImageManager.IsTwitter = false;

if(!ImageManager.IsTwitter) {

ImageManager.lPlayer = function(filename) {
	return this.loadBitmap("img/player/", filename);
};

ImageManager.lGeneration = function(filename) {
	return this.loadBitmap("img/generation/", filename);
};

ImageManager.lUi = function(filename) {
	return this.loadBitmap("img/ui/", filename);
};

ImageManager.lTile = function(filename) {
	return this.loadBitmap("img/tiles/", filename);
};

ImageManager.lIcon = function(filename) {
	return this.loadBitmap("img/icons/", filename);
};

ImageManager.lProjectile = function(filename) {
	return this.loadBitmap("img/projectiles/", filename);
};

ImageManager.lEntities = function(filename) {
	return this.loadBitmap("img/entities/", filename);
};

ImageManager.lCursor = function(filename) {
	return this.loadBitmap("img/cursors/", filename);
};

} else {

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
	return this.loadBitmapWTwitter("img/ui/", filename);
};

ImageManager.lTile = function(filename) {
	return this.loadBitmapWTwitter("img/tiles/", filename);
};

ImageManager.lIcon = function(filename) {
	return this.loadBitmapWTwitter("img/icons/", filename);
};

ImageManager.lProjectile = function(filename) {
	return this.loadBitmap("img/projectiles/", filename);
};

ImageManager.lEntities = function(filename) {
	return this.loadBitmapWTwitter("img/entities/", filename);
};

ImageManager.lCursor = function(filename) {
	return this.loadBitmapWTwitter("img/cursors/", filename);
};

}
