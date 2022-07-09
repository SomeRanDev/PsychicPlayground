
Input.keyMapper[27] = "esc";
Input.keyMapper[32] = "space";
Input.keyMapper[87] = "w";
Input.keyMapper[83] = "s";
Input.keyMapper[65] = "a";
Input.keyMapper[68] = "d";
Input.keyMapper[69] = "e";
Input.keyMapper[77] = "m";
Input.keyMapper[120] = "F9";
for(let i = 49, j = 1; i <= 57; i++, j++) {
	Input.keyMapper[i] = "" + j;
}

Input.keyMapper[90] = "z";
Input.keyMapper[88] = "x";
Input.keyMapper[67] = "c";

Input.gamepadMapper = {};

TouchInput.wheelScrolled = 0;

TouchInput.__old__setupEventHandlers = TouchInput._setupEventHandlers;
TouchInput._setupEventHandlers = function() {
	TouchInput.__old__setupEventHandlers.apply(this, arguments);
	document.addEventListener("mouseleave", function() {
		TouchInput.mouseInside = false;
	});
};

TouchInput.__old_onMouseMove = TouchInput._onMouseMove;
TouchInput._onMouseMove = function(event) {
	TouchInput.__old_onMouseMove.apply(this, arguments);
	TouchInput.mouseInside = true;
};

TouchInput.__old__onWheel = TouchInput._onWheel;
TouchInput._onWheel = function(event) {
	TouchInput.__old__onWheel.apply(this, arguments);
	TouchInput.wheelScrolled = event.deltaY;
};

modify_Input = class {
	static clear() {
		PP.Input.clear.apply(this, arguments);

		this.InputVector = new Vector2(0, 0);

		this.InputDir = 0;
		this.Input4Dir = 0;

		this.TrueTriggeredTimes = [];
		this.TrueReleasedTimes = [];
		this.TrueTriggerTimer = 0;
		this.InputPressed = false;
	}
	
	static update() {
		this.TrueTriggerTimer++;

		if(this._currentState[this._latestButton]) {
			this._pressedTime++;
		} else {
			this._latestButton = null;
		}
		for(const name in this._currentState) {
			if(this._currentState[name] && !this._previousState[name]) {
				this.TrueTriggeredTimes[name] = this.TrueTriggerTimer + 1;
				this._latestButton = name;
				this._pressedTime = 0;
				this._date = Date.now();
			} else if(!this._currentState[name] && this._previousState[name]) {
				this.TrueReleasedTimes[name] = this.TrueTriggerTimer + 1;
			}
			this._previousState[name] = this._currentState[name];
		}

		if(this._virtualButton) {
			this._latestButton = this._virtualButton;
			this._pressedTime = 0;
			this._virtualButton = null;
		}

		this._updateDirection();
		this.updateInputVector();
	}

	static _onKeyDown(event) {
		PP.Input._onKeyDown.apply(this, arguments);
		
		if(!event.repeat) {
			const buttonName = this.keyMapper[event.keyCode];
			if(buttonName) {
				this.TrueTriggeredTimes[buttonName] = this.TrueTriggerTimer + 1;
			}
		}
	}

	static _onKeyUp(event) {
		PP.Input._onKeyUp.apply(this, arguments);

		if(!event.repeat) {
			const buttonName = this.keyMapper[event.keyCode];
			if(buttonName) {
				this.TrueReleasedTimes[buttonName] = this.TrueTriggerTimer + 1;
			}
		}
	}

	static isPressed(keyName) {
		if(Input._PP_isDisabled) return false;
		return PP.Input.isPressed.apply(this, arguments);
	}

	static isTriggered(keyName) {
		if(Input._PP_isDisabled) return false;
		return PP.Input.isTriggered.apply(this, arguments);
	}

	static isTriggeredEx(keyName) {
		if(Input._PP_isDisabled) return false;
		return (this.TrueTriggeredTimes[keyName] ?? 0) === this.TrueTriggerTimer;
	}

	static isReleasedEx(keyName) {
		if(Input._PP_isDisabled) return false;
		return (this.TrueReleasedTimes[keyName] ?? 0) === this.TrueTriggerTimer;
	}

	static isTriggeredExOverride(keyName) {
		return (this.TrueTriggeredTimes[keyName] ?? 0) === this.TrueTriggerTimer;
	}

/*
	static isOkTriggeredEx() {
		return Input.isTriggeredExOverride("space") || PP.Input.isTriggered.call(this, "ok") || TouchInput.isLeftClickTriggered() || PP.Input.isTriggered.call(this, "button_a");
	}

	static isCancelTriggeredEx() {
		return Input.isTriggeredExOverride("esc") || PP.Input.isTriggered.call(this, "cancel") || TouchInput.isRightClickTriggered() || PP.Input.isTriggered.call(this, "button_b");
	}

	static isOkTriggeredExNoMouse() {
		return Input.isTriggeredExOverride("space") || PP.Input.isTriggered.call(this, "ok") || PP.Input.isTriggered.call(this, "button_a");
	}

	static isOkTriggeredForGameplay() {
		return Input.isTriggeredEx("space") || Input.isTriggeredEx("ok") || Input.isTriggeredEx("button_a");
	}

	static menuLeftRepeated() {
		return Input.isRepeated("a") || Input.isRepeated("dpad_left") || Input.isDirectionTriggered("left");
	}

	static menuRightRepeated() {
		return Input.isRepeated("d") || Input.isRepeated("dpad_right") || Input.isDirectionTriggered("right");
	}
	*/

	static updateInputVector() {
		this.InputVector.x = 0;
		this.InputVector.y = 0;

		if(Input._ESP_isDisabled) {
			this.InputDir = 0;
			this.Input4Dir = 0;
			return false;
		}

		if(Input.isPressed("a") /* || Input.isPressed("dpad_left") */) this.InputVector.x--;
		if(Input.isPressed("d") /* || Input.isPressed("dpad_right") */) this.InputVector.x++;

		if(Input.isPressed("w") /* || Input.isPressed("dpad_up") */) this.InputVector.y--;
		if(Input.isPressed("s") /* || Input.isPressed("dpad_down") */) this.InputVector.y++;
	
		this.InputPressed = this.InputVector.length() > 0;
	
		if(this.InputVector.length() >= 1) this.InputVector.normalize();

		const degrees = (Input.InputVector.direction() * (180.0 / Math.PI));
		this.InputDir = Math.round(degrees / 45);
		if(degrees >= -157.5 && degrees < -112.5) {
			this.InputDir = 7;
		} else if((degrees >= -180 && degrees <= -157.5) ||
				(degrees <= 180 && degrees >= 157.5)) {
			this.InputDir = 4;
		} else {
			if(this.InputDir < 0) this.InputDir = 10 + this.InputDir;
			else if(this.InputDir > 0 && this.InputDir < 4) this.InputDir = 4 - this.InputDir;
			if(this.InputPressed && this.InputDir === 0) this.InputDir = 6;
		}

		this.Input4Dir = (this.InputDir === 1 || this.InputDir === 7) ? 4 : ((this.InputDir === 9 || this.InputDir === 3) ? 6 : this.InputDir);
	}
}
