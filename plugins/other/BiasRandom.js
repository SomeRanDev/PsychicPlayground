class BiasRandom {
	constructor(trueThreashold, offsetIncrement = 0.1, resetOnFalse = false) {
		this.trueThreashold = trueThreashold;
		this.offsetIncrement = offsetIncrement;
		this.resetOnFalse = resetOnFalse;
		this.offset = 0;
	}

	getBool() {
		const threshold = (this.trueThreashold + this.offset);
		if(Math.random() < threshold) {
			this.offset -= this.offsetIncrement;
			return true;
		}
		if(this.resetOnFalse) {
			this.offset = 0;
		} else {
			this.offset += this.offsetIncrement;
		}
		return false;
	}

	reset() {
		this.offset = 0;
	}

	static get(id, trueThreashold, offsetIncrement = 0.1, resetOnFalse = false) {
		if(!this._ids) {
			this._ids = {};
		}
		if(!this._ids[id]) {
			this._ids[id] = new BiasRandom(trueThreashold, offsetIncrement, resetOnFalse);
		}
		return this._ids[id].getBool();
	}
}