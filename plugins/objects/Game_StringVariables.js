var $keyVars = null;

class Game_StringVariables {
	constructor() {
		this.data = {};
	}

	load(data) {
		if(data) {
			this.data = data;
		}
	}

	save() {
		return this.data;
	}

	on(key) {
		return this.data[key];
	}

	off(key) {
		return !this.data[key];
	}

	setOn(key) {
		this.data[key] = true;
	}

	setOff(key) {
		this.data[key] = false;
	}

	getData(key) {
		return this.data[key];
	}

	setData(key, data) {
		this.data[key] = data;
	}
}
