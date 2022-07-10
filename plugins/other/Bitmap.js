

PP.Bitmap_load = Bitmap.load;
Bitmap.load = function() {
	const result = PP.Bitmap_load.apply(this, arguments);
	result.smooth = false;
	return result;
};

Bitmap.prototype._drawTextOutline = function(text, tx, ty, maxWidth) {
};

Bitmap.prototype._drawTextBody = function(text, tx, ty, maxWidth) {
	const context = this.context;

	context.imageSmoothingEnabled = false;
	context.fillStyle = "#000000";
	context.fillText(text, tx + 1, ty + 1, maxWidth);
};

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
