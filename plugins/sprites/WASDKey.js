class WASDKey extends Sprite {
	constructor() {
		super();

		this.anchor.set(0.5);

		this.alpha = 0;

		this._removeSelf = false;
		this._active = true;

		const w = new Key("W", null);
		w.move(0, -20);
		SpriteManager.removeUi(w);
		this.addChild(w);

		const s = new Key("S", null);
		s.move(0, 4);
		SpriteManager.removeUi(s);
		this.addChild(s);

		const a = new Key("A", null);
		a.move(-30, 4);
		SpriteManager.removeUi(a);
		this.addChild(a);

		const d = new Key("D", null);
		d.move(30, 4);
		SpriteManager.removeUi(d);
		this.addChild(d);

		SpriteManager.addUi(this);
	}

	update() {
		if(!this._active) return;
		if(this._removeSelf) {
			this.alpha -= 0.1;
			if(this.alpha <= 0) {
				SpriteManager.removeUi(this);
				this.destroy();
				this._active = false;
			}
		}
		if(this.alpha < 1) {
			this.alpha += 0.03;
		}
	}

	removeSelf() {
		this._removeSelf = true;
	}
}