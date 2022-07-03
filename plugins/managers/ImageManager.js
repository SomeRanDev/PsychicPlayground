

ImageManager.IsTwitter = false;

ImageManager.lPlayer = function(filename) {
    return this.loadBitmap("img/player/", filename + (ImageManager.IsTwitter ? "_twitter" : ""));
};

