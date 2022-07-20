Scene_Message.prototype.messageWindowRect = function() {
	const ww = Graphics.boxWidth / 2;
	const wh = this.calcWindowHeight(2, false) + 16;
	const wx = (Graphics.boxWidth - ww) / 2;
	const wy = 0;
	return new Rectangle(wx, wy, ww, wh);
};

Scene_Message.prototype.refreshMessageWindowPos = function(event) {
	const r = this.messageWindowRect();
	if(!event) {
		this._messageWindow.move(200, Graphics.height - r.height - 12, Graphics.width - 400, r.height);
		return;
	}
	const x = event ? ((event._realX * TS) - (this.PPCameraX)) : 0;
	const y = event ? ((event._realY * TS) - this.PPCameraY) : 0;
	this._messageWindow.move(
		x - (r.width / 2),
		y - 180,
		r.width,
		r.height
	);
};

Window_Base.prototype.makeFontBigger = function() {
    this.contents.fontSize += 6;
};

Window_Base.prototype.makeFontSmaller = function() {
    this.contents.fontSize -= 6;
};

modify_Window_ChoiceList = class {
	update() {
		PP.Window_ChoiceList.update.apply(this, arguments);
		this.updatePlacement();
	}

	windowX() {
		return this._messageWindow.x + this._messageWindow.width;
	}

	windowY() {
		return this._messageWindow.y;
	}
}

modify_Window_Message = class {
	updatePlacement() {
		if(SceneManager._scene.refreshMessageWindowPos) {
			SceneManager._scene.refreshMessageWindowPos($gameTemp.currentEvent);
		}
	}

	update() {
		PP.Window_Message.update.apply(this, arguments);
		if(this.doesContinue()) {
			this.updatePlacement();
		}
	}

	isTriggered() {
		if(Input.isTriggeredEx("space")) {
			return true;
		}
		return PP.Window_Message.isTriggered.apply(this, arguments);
	}

	resetFontSettings() {
		this.contents.fontFace = "msg-font";
		this.contents.fontSize = $gameSystem.mainFontSize() - 8;
		this.resetTextColor();
	}
}

Window_Selectable.prototype.isOkTriggered = function() {
	if(Input.isTriggeredEx("space")) {
		return true;
	}
	return this._canRepeat ? Input.isRepeated("ok") : Input.isTriggered("ok");
};


Window_Selectable.prototype.processCursorMove = function() {
	if (this.isCursorMovable()) {
		const lastIndex = this.index();
		if (Input.isRepeated("down") || Input.isRepeated("s")) {
			this.cursorDown(Input.isTriggered("down"));
		}
		if (Input.isRepeated("up") || Input.isRepeated("w")) {
			this.cursorUp(Input.isTriggered("up"));
		}
		if (Input.isRepeated("right") || Input.isRepeated("d")) {
			this.cursorRight(Input.isTriggered("right"));
		}
		if (Input.isRepeated("left") || Input.isRepeated("a")) {
			this.cursorLeft(Input.isTriggered("left"));
		}
		if (!this.isHandled("pagedown") && Input.isTriggered("pagedown")) {
			this.cursorPagedown();
		}
		if (!this.isHandled("pageup") && Input.isTriggered("pageup")) {
			this.cursorPageup();
		}
		if (this.index() !== lastIndex) {
			this.playCursorSound();
		}
	}
};
