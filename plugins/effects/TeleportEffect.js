class TeleportEffect {
	constructor(holder, targetPos) {
		this.disallowMovement = true;

		this.holder = holder;
		this.sprite = holder.sprite;

		this.targetPos = targetPos;

		this.moved = false;

		this._time = 0;
	}

	update() {
		this._time += 0.02;
		if(this._time > 1) this._time = 1;

		this.updateAni();

		if(!this.moved && this._time >= 0.5) {
			this.moved = true;
			this.holder.moveTo(TS * this.targetPos.x, TS * this.targetPos.y);
		}

		if(this._time >= 1) {
			this.removeSelf();
		}
	}

	removeSelf() {
		this.holder.removeEffect(this);
		this.sprite.scale.set(1);
	}

	updateAni() {
		const r = this._time < 0.5 ? (this._time / 0.5) : (1 - ((this._time - 0.5) / 0.5));
		if(r < 0.5) {
			const a = r / 0.5;
			this.sprite.scale.set(1 * (1 + (0.5 * a.cubicIn())), 1 * (1 - (0.5 * a.cubicIn())));
			this.sprite.setColorTone([255 * a, 255 * a, 255 * a, 255 * a]);
		} else {
			const a = ((r - 0.5) / 0.5);
			this.sprite.scale.set(1 * (1.5 - (1.5 * a.cubicOut())), 1 * (0.5 + (2 * a.cubicOut())));
			this.sprite.setColorTone([255, 255, 255, 255]);
		}
	}
}