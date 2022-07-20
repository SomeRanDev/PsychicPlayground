class TitleButton extends Sprite {
	constructor(parent, text, width, height) {
		super();

		this._hitParent = parent;

		this._hitWidth = width;
		this._hitHeight = height;

		this._clicked = false;
		this._notClicked = false;
		this._selected = false;

		this._clickAni = 0;
		this._hoverAni = 0;

		this.anchor.set(0.5);

		this.alpha = 0.75;

		this.text = PP.makeText(text, 20);
		this.text.y = 0;
		this.text.anchor.set(0.5);
		this.addChild(this.text);
	}

	reset() {
		this.scale.set(1);
		this.move(this._originalX, this._originalY);
		this.text.move(0, 0);

		this._clicked = false;
		this._notClicked = false;
		this._selected = false;

		this._clickAni = 0;
		this._hoverAni = 0;

		this.anchor.set(0.5);

		this.alpha = 0.75;
	}

	update() {
		if(this._notClicked) {
			const newClick = this._clickAni.moveUnderTowards(1, 0.05);

			if(this._clickAni !== newClick) {

				this.x = PP.lerp(this._startX, this._endX, newClick.cubicOut());
				this._clickAni = newClick;
			}

			return;
		}

		if(this._clicked) {
			const newClick = this._clickAni.moveTowardsCond(this._clicked, 0, 1, 0.05);
			if(this._clickAni !== newClick) {
				this._clickAni = newClick;

				const finalScale = 1 + (newClick * 0.5);

				if(newClick < 0.5) {
					const r = (newClick / 0.5).cubicOut();
					this.scale.set((1 - (r * 0.3)) * finalScale, (1 + (r * 1.5)));
				} else {
					const r = (1 - ((newClick - 0.5) / 0.5)).cubicIn();
					this.scale.set((1 - (r * 0.3)) * finalScale, (1 + (r * 1.5)) * finalScale);
				}

				{
					let r;
					if(newClick < 0.3) {
						r = ((newClick / 0.3).cubicOut() * -1);
					} else {
						r = (-1) + ((((newClick - 0.3) / 0.7)).cubicOut() * 2);
					}

					this.y = PP.lerp(this._startY, this._endY, r.clamp(0, 1));
				}

				if(newClick >= 1) {
					if(this.onClick) this.onClick();
				}
			}
		} else {
			if(this.isBeingTouched()) {
				this._hitParent.setSelected(this);
			}
		}

		const newHover = this._hoverAni.moveTowardsCond(this._selected, 0, 1, 0.2);
		if(this._hoverAni !== newHover) {
			this._hoverAni = newHover;
			this.alpha = 0.75 + (0.25 * newHover);
			this.text.x = this._selected ? 2 : 0;
			//this.text.y = this._selected ? 2 : 0;
		}
	}

	setSelected(v) {
		if(this._selected !== v) {
			this._selected = v;
		}
	}

	setNotClicked() {
		this._notClicked = true;

		this._startX = this.x;
		this._endX = Graphics.width + 200;
	}

	setClicked() {
		this._notClicked = false;
		this._clicked = true;
		this._selected = true;

		this._startY = this.y;
		this._endY = (Graphics.height / 2);
	}

	isBeingTouched() {
		const touchPos = new Point(TouchInput.x, TouchInput.y);
		const localPos = this.worldTransform.applyInverse(touchPos);
		return this.hitTest(localPos.x, localPos.y);
	}

	hitTest(x, y) {
		const rect = new Rectangle(
			-0.5 * this._hitWidth,
			(-0.5 * this._hitHeight),
			this._hitWidth,
			this._hitHeight
		);
		return rect.contains(x, y);
	}
}
