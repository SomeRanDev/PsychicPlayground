class NumberInput extends ChoiceInput {
	constructor(label, width, height) {
		super([], label, width, height);

		this._number = 1;
		this._min = 0;
		this._max = 10;
		this.updateText();
	}

	getNumber() {
		return this._number;
	}

	canLeft() {
		return this._number > this._min;
	}

	canRight() {
		return this._number < this._max;
	}

	onChangeChoice(dir) {
		this._number += dir;
	}

	updateText() {
		this.text.text = "" + this._number;
	}
}