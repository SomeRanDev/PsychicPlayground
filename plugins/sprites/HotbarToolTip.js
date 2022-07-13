class HotbarToolTip extends Window_Base {
	constructor(type) {
		super(new Rectangle(0, 0, 128, 74));
		this._dataId = -1;
		this._type = type;

		this.setFakeOpenness(0);

		switch(type) {
			case 0: {
				this.setTone(-71, -71, 61);
				break;
			}
			case 1: {
				this.setTone(-71, 61, -71);
				break;
			}
			case 2: {
				this.setTone(61, 61, -71);
				break;
			}
		}

		this.contents.outlineWidth = 0;
		this.contents.outlineColor = "rgba(0, 0, 0, 1)";
	}

	setDataId(dataId) {
		dataId ??= -1;
		this._dataId = dataId;

		let name = "";
		let desc = "";
		if(dataId !== -1) {
			switch(this._type) {
				case 0: {
					name = AbilityTypes[dataId].name;
					desc = AbilityTypes[dataId].desc ?? "";
					break;
				}
				case 1: {
					name = MaterialTypes[dataId].name;
					desc = (MaterialTypes[dataId].desc ?? "") + ("\n" + MaterialTypes[dataId].damage + " DMG");
					break;
				}
				case 2: {
					name = ItemTypes[dataId].name;
					desc = ItemTypes[dataId].desc ?? "";
					break;
				}
			}
		}

		this.contents.clear();

		this.contents.fontSize = 24;
		this.drawText(name, 2, -10, this.contentsWidth() - 4, "center");

		this.contents.fontSize = 16;
		const descLines = desc.split("\n");
		for(let i = 0; i < descLines.length; i++) {
			this.drawText(descLines[i], 2, 11 + (i * 13), this.contentsWidth() - 4, "center");
		}
	}

	update() {
		if(this._dataId >= 0 && !this.isOpen()) {
			this.addFakeOpenness(0.08);
		} else if(this._dataId < 0 && !this.isClosed()) {
			this.addFakeOpenness(-0.08);
		}
	}

	addFakeOpenness(o) {
		this.setFakeOpenness(this._fakeOpenness + o);
	}

	setFakeOpenness(o) {
		if(this._fakeOpenness !== o) {
			this._fakeOpenness = o.clamp(0, 1);
			this.openness = Math.round((this._dataId < 0 ? this._fakeOpenness : this._fakeOpenness.cubicOut()) * 255);
			this.alpha = 1.0 * this._fakeOpenness;
		}
	}
}