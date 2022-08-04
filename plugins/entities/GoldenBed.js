class GoldenBed extends Interactable {
	constructor(x, y) {
		super(x, y, {
			_realX: (x) + 0.5,
			_realY: (y) + 1
		}, "GoldenBed", 1, 999, []);
	}

	makeSprite() {
		super.makeSprite();

		this.sprite.anchor.set(0, 0);

		this.key.x = 8;
		this.key.y = 6;

		return this.sprite;
	}

	setAnimationFrame(f) {
		this.sprite.visible = true;
	}

	updateKey(r) {
		if(this.key) {
			this.key.y = 6 - (5 * r.cubicOut());
			this.key.alpha = r;
		}
	}

	runEvent() {
		$gameTemp.reserveCommonEvent(9);
	}

	isCloseToPlayer() {
		return Math.abs(((this.x * TS) + 16) - $ppPlayer.position.x) < 40 &&
			Math.abs(((this.y * TS) + 32) - $ppPlayer.position.y) < 80;
	}

	static canExist() {
		return $keyVars.off("GoldenBed_" + $gameMap.mapId());
	}

	stopExisting() {
		$keyVars.setOn("GoldenBed_" + $gameMap.mapId());
		$gameMap.removeEntity(this);
		this.destroy();
	}

	interactSound() {
		playSe("LevelUp", 100);
	}
}