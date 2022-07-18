class BedEffect {
	constructor(holder, targetPos) {
		this.disallowMovement = true;

		this.holder = holder;
		this.sprite = holder.sprite;

		this.startPos = holder.position;
		this.targetPos = {
			x: targetPos.x - holder.position.x,
			y: targetPos.y - holder.position.y
		};

		this._time = 0;

		$gameTemp.forceWait = true;
	}

	update() {
		this._time += 0.025;
		if(this._time > 1) this._time = 1;

		const r = this._time;
		if(r < 0.3) {
			const a = r / 0.3;
			this.holder.spriteOffsetY = (this.targetPos.y - 30) * a.cubicOut();
		} else if(r <= 0.6) {
			const b = ((r - 0.3) / 0.6);
			this.holder.spriteOffsetY = (this.targetPos.y - 30) + (30 * b.cubicOut());
		} else {
			this.sprite.setSleep();
			if(r < 0.8) {
				const c = ((r - 0.6) / 0.2).cubicOut();
				this.sprite.scale.set(1 + (c * 0.4), 1 - (c * 0.4));
			} else {
				const d = ((r - 0.8) / 0.2).cubicOut();
				this.sprite.scale.set(1.4 - (d * 0.4), 0.6 + (d * 0.4));
			}
			this.holder.spriteOffsetY = this.targetPos.y;
		}
		this.holder.spriteOffsetX = this.targetPos.x * r;
		

		if(this._time >= 1) {
			this.removeSelf();
		}
	}

	removeSelf() {
		this.holder.removeEffect(this);
		this.sprite.scale.set(1);
		$gameTemp.forceWait = false;
	}
}
