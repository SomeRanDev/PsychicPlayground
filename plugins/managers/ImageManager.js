

ImageManager.IsTwitter = false;

ImageManager.lPlayer = function(filename) {
	return this.loadBitmap("img/player/", filename + (ImageManager.IsTwitter ? "_Twitter" : ""));
};

ImageManager.lTile = function(filename) {
	const result = this.loadBitmap("img/tiles/", filename + (ImageManager.IsTwitter ? "_Twitter" : ""));
	result.repeatWrap = true;
	return result;
};

