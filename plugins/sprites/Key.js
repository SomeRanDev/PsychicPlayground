class Key extends Sprite {
	constructor(letter, subText, isSpace = false) {
		super(ImageManager.lUi(isSpace ? "SpaceKey" : "Key"));

		this.scale.set(2);

		this._text = PP.makeText(letter, 8);
		this._text.x = 8;
		this._text.y = 4;
		this._text.resolution = 5;
		this._text.anchor.set(0.5);
		this.addChild(this._text);

		if(subText) {
			this._subText = PP.makeText(subText, 8);
			this._subText.anchor.set(0, 1);
			this._subText.x = 14;
			this._subText.y = 12;
			this._subText.resolution = 5;
			this.addChild(this._subText);
		}

		SpriteManager.addUi(this);
	}
}