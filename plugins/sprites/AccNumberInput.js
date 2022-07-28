class AccNumberInput extends ChoiceInput {
	constructor(label, width, height) {
		super([], label, width, height);

		this._number = 1;
		this._min = 0;
		this._max = 10;
		this.updateText();
	}

	pointsRemaining() {
		let total = 0;
		for(const o of this._others) {
			total += o.getNumber() - o._min;
		}
		return this._totalMax - total;
	}

	setOthers(others, min, max, totalMax) {
		this._min = min;
		this._max = max;
		this._totalMax = totalMax;
		this._others = others;
	}

	getNumber() {
		return this._number;
	}

	getTextTint() {
		return this.canLeft() ? 0xeecc44 : 0xffffff;
	}

	setNumber(n) {
		this._number = n;
		this.updateText();
	}

	canLeft() {
		return this._number > this._min;
	}

	canRight() {
		let total = 0;
		for(const o of this._others) {
			if(this !== o) {
				total += o.getNumber() - o._min;
			}
		}
		return (this._number - this._min) < Math.min(this._totalMax - total, this._max - this._min);
	}

	onChangeChoice(dir) {
		this._number += dir;
	}

	updateText() {
		this.text.text = "" + this._number;
		this.text.style.fill = this.getTextTint();
	}
}