class Hotbar extends Sprite {
	constructor() {
		super();

		this._pieces = [
			this.makeHotbarPiece("SkillsHotbar", 0),
			this.makeHotbarPiece("MaterialsHotbar", 1),
			this.makeHotbarPiece("ItemsHotbar", 2),
		];

		this.anchor.set(0.5, 1);
		this.move(Graphics.width / 2, Graphics.height - 20);

		SpriteManager.addUi(this);
	}

	makeHotbarPiece(path, index) {
		const piece = new Sprite(ImageManager.lUi(path));
		piece.anchor.set(0.5, 1);
		piece.scale.set(2);
		piece.move(index === 0 ? -110 : (index === 1 ? 0 : 110), 0);
		this.addChild(piece);
		return piece;
	}
}