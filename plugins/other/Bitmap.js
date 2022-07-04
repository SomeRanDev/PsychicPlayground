
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
};
