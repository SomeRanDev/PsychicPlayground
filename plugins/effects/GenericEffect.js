class GenericEffect {
	constructor(holder, color, onMid = null) {
		this.disallowMovement = false;

		this.holder = holder;
		this.sprite = holder.sprite;

		this.color = color;
		this.onMid = onMid;
		this.hitMid = false;

		this._time = 0;
	}

	update() {
		this._time += 0.05;

		const r = this._time;
		if(r < 0.5) {
			const a = (r / 0.5).cubicOut();
			this.sprite.scale.set((1 - (a * 0.3)) * 1, (1 + (a * 0.3)) * 1);
			this.sprite.setBlendColor([this.color[0] * a, this.color[1] * a, this.color[2] * a, this.color[3] * a]);
		} else {
			if(!this.hitMid) {
				this.hitMid = true;
				if(this.onMid) this.onMid();
			}

			const b = (((r - 0.5) / 0.5));
			this.sprite.scale.set((0.7 + (b * 0.3)) * 1, (1.3 - (b * 0.3)) * 1);

			const c = 1 - b;
			this.sprite.setBlendColor([this.color[0] * c, this.color[1] * c, this.color[2] * c, this.color[3] * c]);
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