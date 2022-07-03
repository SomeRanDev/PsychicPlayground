
class Player {
	constructor() {
		SpriteManager.addEntity(this);
	}

	makeSprite() {
		this.sprite = new PlayerSprite(this);
		return this.sprite;
	}

	loadData() {
	}

	saveData() {
	}
}