
class Player {
	constructor() {
		SpriteManager.addEntity(this);

		this.position = new Vector2(0, 0);
		this.speed = 3;//2;

		this.TURN_RATE = 9.0;

		this.targetDirection = 0;
		this.currentDirection = 0;
		this.lastAngle = 0;
	}

	makeSprite() {
		this.sprite = new PlayerSprite(this);
		return this.sprite;
	}

	loadData() {
	}

	saveData() {
	}

	showPopup(text) {
		this.sprite.addText(text);
	}

	gainMaterial(blockId) {
		this.showPopup("+12 Wood");
	}

	cameraX() { return this.position.x; }
	cameraY() { return this.position.y; }

	update() {
		const isMoving = this.isMoving();
		const lastDirection = this.currentDirection;

		if(isMoving) {
			this.updateTargetDirection();

			this.position.x = Math.round(CollisionManager.processMovementX(this.position.x, this.position.y, (this.speed * Input.InputVector.x)));
			this.position.y = Math.round(CollisionManager.processMovementY(this.position.x, this.position.y, (this.speed * Input.InputVector.y)));
		}

		this.updateTurning(lastDirection);

		if(this.sprite) {
			if(isMoving) {
				this.sprite.setWalk();
			} else {
				this.sprite.setIdle();
			}
		}
	}

	isMoving() {
		return Input.InputVector.length() > 0;
	}

	updateTargetDirection() {
		var degrees = Math.atan2(-Input.InputVector.y, Input.InputVector.x) * (180.0 / Math.PI);
		while(degrees < 0) {
			degrees += 360;
		}
		this.targetDirection = degrees;
	}

	updateTurning(lastDirection) {
		lastDirection = lastDirection || this.currentDirection;
		this.moveCurrentDirectionTowardsTarget();
		this.updateLastAngle(lastDirection);
		if(this.sprite) this.sprite.setDirection(this.getLastAngleAsNumpad());
	}

	moveCurrentDirectionTowardsTarget() {
		const Spd = this.TURN_RATE;
		this.currentDirection = RotateTowards(this.currentDirection, this.targetDirection, Spd);
	}

	updateLastAngle(lastDirection) {
		if(Math.abs(this.currentDirection - lastDirection) > 0.01) {
			this.lastAngle = Math.round((this.currentDirection / 360.0) * 8);
		}
	}

	getLastAngleAsNumpad() {
		return this.linearAngleToNumpad(this.lastAngle);
	}

	linearAngleToNumpad(Num) {
		switch(Num) {
			case 0: return 6;
			case 1: return 9;
			case 2: return 8;
			case 3: return 7;
			case 4: return 4;
			case 5: return 1;
			case 6: return 2;
			case 7: return 3;
			case 8: return 6;
			case _: return 2;
		};
	}
}

function RotateTowards(Curr, Target, Spd) {
	var Offset = Math.abs(Curr - Target);

	// To add variety to which direction the player turns when making a 180 turn,
	// this formula is used to procedurally add 1 to the offset
	// (thus making the turn occur in the other direction).
	if(Math.abs(Offset - 180) < 0.01) {
		if((Math.floor(Math.round(Target / 27))) % 2 == 1) {
			Offset += 1.0;
		}
	}

	if(Offset > 0.01) {
		if(Offset > 180) {
			if(Curr < Target) {
				Curr -= Spd;
				if ((Curr + 360) < Target) {
					Curr = Target;
				}
				while(Curr < 0) {
					Curr += 360;
				}
			} else if(Curr > Target) {
				Curr += Spd;
				if((Curr - 360) > Target) {
					Curr = Target;
				}
				while(Curr > 360) {
					Curr -= 360;
				}
			}
		} else {
			if(Curr < Target) {
				Curr += Spd;
				if(Curr > Target) {
					Curr = Target;
				}
			} else if(Curr > Target) {
				Curr -= Spd;
				if(Curr < Target) {
					Curr = Target;
				}
			}
		}
	}

	return Curr;
}
