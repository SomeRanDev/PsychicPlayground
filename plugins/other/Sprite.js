Sprite.prototype.removeColorFilter = function() {
    if(this._colorFilter) {
        if(this.filters) {
            this.filters.remove(this._colorFilter);
        }
        this._colorFilter = null;
    }
};
