class DeathEffect {
	constructor(holder) {
		this.disallowMovement = false;

		this.holder = holder;
		this.sprite = holder.sprite;

		this.spriteY = this.sprite.y;

		this._time = 0;
	}

	update() {
		this._time += 0.015;

		const r = this._time;
		if(r < 0.35) {
			const rr = (r / 0.35);
			const a = rr.cubicOut();

			this.sprite.y = this.spriteY - (90 * a);
			this.sprite.rotation = rr * Math.PI * 3;

			//this.sprite.scale.set((1 - (a * 0.8)) * 1, (1 + (a * 0.8)) * 1);
			//this.sprite.setBlendColor([a * 255, a * 125, a * 125, a * 255]);
		} else if(r < 0.7) {
			const rr = (((r - 0.35) / 0.35));
			const b = rr.cubicIn();

			this.sprite.y = (this.spriteY - 90) + (90 * b);
			this.sprite.rotation = (Math.PI * 3) + (rr * Math.PI * 3);

			//this.sprite.scale.set((0.2 + (b * 1.5)) * 1, (1.8 - (b * 1.5)) * 1);

			//const c = 1 - b;
			//this.sprite.setBlendColor([c * 255, c * 125, c * 125, c * 255]);
		} else if(r < 0.85) {
			this.sprite.rotation = 0;
			const c = (((r - 0.7) / 0.15)).cubicOut();

			this.sprite.scale.set((1 + (c * 2.3)) * 1, (1 - (c * 0.8)) * 1);
			this.sprite.setBlendColor([c * 255, c * 125, c * 125, c * 255]);

			//this.sprite.scale.set((1.7 - (b * 1.7)) * 1, (0.3 + (b * 2.0)) * 1);
		} else {
			const d = (((r - 0.85) / 0.15)).cubicOut();
			this.sprite.scale.set((3.3 - (d * 3.3)) * 1, (0.2 + (d * 2.0)) * 1);
		}

		if(this._time >= 1) {
			this.sprite.y = this.spriteY;
			this.removeSelf();
			return true;
		}

		return false;
	}

	removeSelf() {
		this.holder.removeEffect(this);
		if(this.holder.onDeathEffectDone) {
			this.holder.onDeathEffectDone();
		}
		//this.sprite.scale.set(1);
		//this.sprite.setBlendColor([0, 0, 0, 0]);
	}
}