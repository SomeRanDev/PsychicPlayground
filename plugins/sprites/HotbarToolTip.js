class HotbarToolTip extends Window_Base {
	constructor() {
		super(new Rectangle(0, 0, 128, 64));
		this._dataId = -1;
	}

	setDataId(dataId) {
		this._dataId = dataId;
	}

	update() {
		if(this._dataId >= 0 && !this.isOpen()) {
			this.openness += 40;
		} else if(this._dataId < 0 && !this.isClosed()) {
			this.openness -= 40;
		}
	}
}