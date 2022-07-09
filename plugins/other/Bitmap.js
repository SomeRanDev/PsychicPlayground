

PP.Bitmap_load = Bitmap.load;
Bitmap.load = function() {
	const result = PP.Bitmap_load.apply(this, arguments);
	result.smooth = false;
	return result;
};

/*
Object.defineProperty(Bitmap.prototype, "repeatWrap", {
	get: function() {
		return this._repeatWrap;
	},
	set: function(value) {
		if (this._repeatWrap !== value) {
			this._repeatWrap = value;
			this._updateWrapMode();
		}
	},
	configurable: true
});

Bitmap.prototype.__old_initialize = Bitmap.prototype.initialize;
Bitmap.prototype.initialize = function() {
	Bitmap.prototype.__old_initialize.apply(this, arguments);
	this._repeatWrap = false;
}

Bitmap.prototype.__old_createBaseTexture = Bitmap.prototype._createBaseTexture;
Bitmap.prototype._createBaseTexture = function(source) {
	Bitmap.prototype.__old_createBaseTexture.apply(this, arguments);
	this._updateWrapMode();
};

Bitmap.prototype._updateWrapMode = function() {
	if (this._baseTexture) {
		if (!this._repeatWrap) {
			this._baseTexture.mipmap = PIXI.MIPMAP_MODES.ON;
		} else {
			this._baseTexture.mipmap = PIXI.MIPMAP_MODES.OFF;
		}
	}
};*/

Bitmap.prototype.startFastFillRect = function() {
	this.context.save();
}

Bitmap.prototype.fastFillRect = function(x, y, width, height, color) {
    const context = this.context;
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
};

Bitmap.prototype.endFastFillRect = function() {
	this.context.restore();
    this._baseTexture.update();
}

Bitmap.prototype.getPixelNumberFromRatio = function(x, y) {
	return this.getPixelNumber(x.clamp(0, 1) * (this.width - 1), y.clamp(0, 1) * (this.height - 1));
};

Bitmap.prototype.getPixelAlphaFromRatio = function(x, y) {
	return this.getAlphaPixel(x.clamp(0, 1) * (this.width - 1), y.clamp(0, 1) * (this.height - 1));
};

Bitmap.prototype.getPixelNumber = function(x, y) {
	const data = this.context.getImageData(x, y, 1, 1).data;
	let result = 0;
	for (let i = 0; i < 3; i++) {
		result |= (data[i] << (8 * i));
	}
	return result;
};

Bitmap.prototype.getImageData = function() {
    return this.context.getImageData(0, 0, this.width, this.height);
};

Bitmap.prototype.setImageData = function(imageData) {
    this.context.putImageData(imageData, 0, 0);
    this._baseTexture.update();
};
