
class Wall {
	constructor(url) {
		this.init(url);
		SpriteManager.addEntity(this);
	}

	init(url) {
		this._textureUrl = url;
		if(this.baseSprite) {
			this.baseSprite.visible = true;
			this.baseSprite.bitmap = ImageManager.lTile(this._textureUrl);
		}
	}

	destroy() {
		this.baseSprite.visible = false;
	}

	setPosition(globalX, globalY) {
		this.baseSprite.move(globalX, globalY + 32);
	}

	makeSprite() {
		if(this.baseSprite) return this.baseSprite;

		this.baseSprite = new Sprite();
		this.baseSprite.scale.set(2);
		this.baseSprite.anchor.set(0.5, 1);
		this.baseSprite.visible = true;
		this.baseSprite.bitmap = ImageManager.lTile(this._textureUrl);
		return this.baseSprite;
	}
}
