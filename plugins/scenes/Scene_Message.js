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
		const positionType = $gameMessage.choicePositionType();
		if(positionType === 3) {
			return this._messageWindow.x + (this._messageWindow.width / 2) - (this.width / 2);
		}
		return this._messageWindow.x + this._messageWindow.width;
	}

	windowY() {
		const positionType = $gameMessage.choicePositionType();
		if(positionType === 3) {
			return this._messageWindow.y + (this._messageWindow.height);
		}
		return this._messageWindow.y;
	}

	windowWidth() {
		const positionType = $gameMessage.choicePositionType();
		if(positionType === 3) {
			return 280;
		}
		return PP.Window_ChoiceList.windowWidth.apply(this, arguments);
	}

	maxLines() {
		if($gameMessage.choicePositionType() === 3) {
			return 7;
		}
		return PP.Window_ChoiceList.maxLines.apply(this, arguments);
	};

	lineHeight() {
		if($gameMessage.choicePositionType() === 3) {
			return 20;
		}
		return PP.Window_ChoiceList.lineHeight.apply(this, arguments);
	}

	resetFontSettings() {
		if($gameMessage.choicePositionType() === 3) {
			this.contents.fontFace = $gameSystem.mainFontFace();
			this.contents.fontSize = $gameSystem.mainFontSize() - 5;
			this.resetTextColor();
		} else {
			PP.Window_ChoiceList.resetFontSettings.apply(this, arguments);
		}
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

	updateInput() {
		if (this.isAnySubWindowActive()) {
			return true;
		}
		if (this.pause) {
			if (this.isTriggered()) {
				Input.update();
				this.pause = false;
				if (!this._textState) {
					this.terminateMessage();
					playFreqSe("Message2");
				}
			}
			return true;
		}
		return false;
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
