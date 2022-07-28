class EnemyHpBar extends Sprite {
	constructor() {
		super(ImageManager.lUi("EnemyHpBarBack"));

		this.anchor.set(0.5, 1);
		//this.scale.set(0.5);

		this.bar = new Sprite(ImageManager.lUi("EnemyHpBarFront"));
		this.bitmap.addLoadListener(() => {
			this.bar.bitmap.addLoadListener(() => {
				this.bar.anchor.set(1 / this.bar.bitmap.width, 0.5);
				this.bar.move((this.bitmap.width / -2) + 1, this.bar.bitmap.height / -2);
			});
		});
		this.addChild(this.bar);
	}

	setRatio(r) {
		r = r.clamp(0, 1);
		if(this._ratio !== r) {
			this._ratio = r;
			this.bar.scale.set(r, 1);
		}
	}
}