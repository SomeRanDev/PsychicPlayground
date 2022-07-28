class TextPopper extends Sprite {
	constructor(holder, offsetX, offsetY) {
		super();

		this._holder = holder;
		this._texts = [];
		this._offsetX = offsetX;
		this._offsetY = offsetY;

		SpriteManager.addHud(this);
	}

	addText(text) {
		const t = PP.makeText(text, 16);
		t.anchor.set(0.5, 1);
		t.x = this._holder.x + this._offsetX;
		t.y = this._holder.y + this._offsetY;
		t._baseX = t.x;
		t._baseY = t.y;
		t._progress = 0;
		this._texts.push(t);
		this.addChild(t);
	}

	addTextEx(text, color) {
		const t = PP.makeText(text, 16);
		t.style.fill = color;
		t.anchor.set(0.5, 1);
		t.x = this._holder.x + this._offsetX;
		t.y = this._holder.y + this._offsetY;
		t._baseX = t.x;
		t._baseY = t.y;
		t._progress = 0;
		this._texts.push(t);
		this.addChild(t);
	}

	update() {
		for(let i = 0; i < this._texts.length; i++) {
			const text = this._texts[i];

			text.x = PP.lerp(text.x, this._holder.x + this._offsetX, 0.2);
			text._baseY = PP.lerp(text._baseY, this._holder.y + this._offsetY + ((this._texts.length - 1) - i) * -16, 0.2);

			text._progress += 0.01;
			if(text._progress > 1) text._progress = 1;

			const p = text._progress;

			text.style.letterSpacing = p < 0.3 ? ((p / 0.3).cubicOut() * 2) : (1 - ((p - 0.3) / 0.6)).cubicOut() * 2;
			text.y = text._baseY - (p.cubicOut() * 15);
			text.alpha = (p > 0.75) ? (1 - ((p - 0.75) / 0.25)) : 1;

			if(p >= 1) {
				this._texts.remove(text);
				this.removeChild(text);
				i--;
			}
		}
	}
}