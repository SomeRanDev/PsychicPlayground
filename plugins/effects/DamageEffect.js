class DamageEffect {
	constructor(holder) {
		this.disallowMovement = false;

		this.holder = holder;
		this.sprite = holder.sprite;

		this._time = 0;
	}

	update() {
		this._time += 0.05;

		const r = this._time;
		if(r < 0.5) {
			const a = (r / 0.5).cubicOut();
			this.sprite.scale.set((1 - (a * 0.3)) * 1, (1 + (a * 0.3)) * 1);
			this.sprite.setBlendColor([a * 255, a * 125, a * 125, a * 255]);
		} else {
			const b = (((r - 0.5) / 0.5));
			this.sprite.scale.set((0.7 + (b * 0.3)) * 1, (1.3 - (b * 0.3)) * 1);

			const c = 1 - b;
			this.sprite.setBlendColor([c * 255, c * 125, c * 125, c * 255]);
		}

		if(this._time >= 1) {
			this.removeSelf();
			return true;
		}

		return false;
	}

	removeSelf() {
		this.holder.removeEffect(this);
		this.sprite.scale.set(1);
		this.sprite.setBlendColor([0, 0, 0, 0]);
	}
}