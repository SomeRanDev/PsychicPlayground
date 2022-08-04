class BedLeaveEffect {
	constructor(holder) {
		this.disallowMovement = false;

		this.holder = holder;
		this.sprite = holder.sprite;
		this.sprite.setSleep();

		this.startPos = {
			x: holder.spriteOffsetX,
			y: holder.spriteOffsetY
		};

		this._notMoveTime = 0;
		this._time = 0;
		this._started = false;
	}

	update() {
		if(!this._started) {
			if(this.holder.isMoving()) {
				this._started = true;

				playSe("Bed", 30);

				if(this._wasdKey) {
					this._wasdKey.removeSelf();
				}
			} else {
				this.sprite.setSleep();

				this._notMoveTime++;
				if(this._notMoveTime === 90) {
					this._wasdKey = new WASDKey();
					const pos = this.sprite.getGlobalPosition();
					this._wasdKey.move(pos.x - 16, pos.y + 50);
				}
			}
			return;
		}

		this._time += 0.05;
		if(this._time > 1) this._time = 1;

		const r = this._time;

		if(r < 0.5) {
			const a = r / 0.5;
			this.holder.spriteOffsetY = (this.startPos.y - (60 * a.cubicOut())) * (1 - r);
		} else {
			const b = (r - 0.5) / 0.5;
			this.holder.spriteOffsetY = (this.startPos.y - (60 * (1 - b).cubicOut())) * (1 - r);
		}

		this.holder.spriteOffsetX = this.startPos.x * (1 - r);

		if(this._time >= 1) {
			this.removeSelf();
		}
	}

	removeSelf() {
		this.holder.spriteOffsetX = 0;
		this.holder.spriteOffsetY = 0;
		this.holder.removeEffect(this);
		if(this.sprite) this.sprite.scale.set(1);
		//this.sprite.setIdle();
	}
}