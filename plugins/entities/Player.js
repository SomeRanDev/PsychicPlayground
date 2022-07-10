
class Player {
	constructor() {
		this.position = new Vector2(0, 0);
		this.speed = 3;//2;
		this.moving = false;

		this.TURN_RATE = 9.0;

		this.targetDirection = 0;
		this.currentDirection = 0;
		this.lastAngle = 0;

		this.canPlaceMaterial = false;

		this.shootFrequency = 24;
		this._projectiles = [];
		this._projectileTime = 0;
		this._projectileTriggeredTime = 0;

		this.inventory = new Inventory();
	}

	makeSprite() {
		this.sprite = new PlayerSprite(this);
		return this.sprite;
	}

	refreshHotbarIcons() {
		if(this.sprite) {
			this.sprite._hotbar.refreshIcons();
		}
	}

	refreshHotbarNumbers() {
		if(this.sprite) {
			this.sprite._hotbar.refreshNumbers();
		}
	}

	loadData() {
	}

	saveData() {
	}

	selectMineables() {
		return this.inventory.isMining();
	}

	showMapCursor() {
		return this.inventory.isMaterial();
	}

	showEnabledCursor() {
		return this.inventory.hasPlacableMaterial();
	}

	maxBuildAmount() {
		return this.inventory.maxBuildAmount();
	}

	isMining() {
		return this.inventory.isMining() && TouchInput.isPressed();
	}

	showPopup(text) {
		this.sprite.addText(text);
	}

	gainMaterial(blockId) {
		const blockData = MineableTypes[blockId];
		if(blockData && blockData.material) {
			const materialId = blockData.material;
			const material = MaterialTypes[materialId];
			if(material) {
				const min = blockData.materialGainMin ?? 0;
				const max = blockData.materialGainMax ?? 0;
				const amount = min + Math.floor(Math.random() * (max - min));
				if(this.inventory.addMaterial(materialId, amount)) {
					this.showPopup("+" + amount + " " + material.name);
				} else {
					this.showPopup("Max " + material.name + "!");
				}
			}
		}
	}

	cameraX() { return this.position.x; }
	cameraY() { return this.position.y; }

	update() {
		this.inventory.update();
		this.updateMovement();
		this.updateProjectileInput();
		this.updateProjectiles();
	}

	enableTileCursorPlacement(b) {
		this.canPlaceMaterial = b;
	}

	updateMovement() {
		this.moving = this.isMoving();
		const lastDirection = this.currentDirection;

		if(this.moving) {
			this.updateTargetDirection();

			this.position.x = Math.round(CollisionManager.processMovementX(this.position.x, this.position.y, (this.speed * Input.InputVector.x)));
			this.position.y = Math.round(CollisionManager.processMovementY(this.position.x, this.position.y, (this.speed * Input.InputVector.y)));
		}

		this.updateTurning(lastDirection);
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

	updateProjectileInput() {
		const isPressed = TouchInput.isPressed();

		if(TouchInput.isTriggered()) {
			this._projectileTriggeredTime = 10;
		} else if(this._projectileTriggeredTime > 0) {
			this._projectileTriggeredTime--;
		}

		if(this._projectileTime === 0) {
			if(isPressed || (this._projectileTriggeredTime > 0)) {
				this._projectileTime = 1;
				this.shoot();
			}
		}
		if(isPressed || this._projectileTime > 0) {
			if(this._projectileTime++ > this.shootFrequency) {
				this._projectileTime = 0;
			}
		}
	}

	shoot() {
		const materialId = this.inventory.hasShootableMaterial();
		const materialData = MaterialTypes[materialId];
		if(materialData) {
			const projectile = ProjectileObjectPool.getObject(
				this.position.x,
				this.position.y,
				TouchInput.worldX,
				TouchInput.worldY,
				materialId,
				materialData.damage,
				180,
				{
					directionRefreshAcc: 12
				}
			);
			this._projectiles.push(projectile);

			this.inventory.addMaterial(materialId, -(materialData.shootCost ?? 1));
		}
	}

	updateProjectiles() {
		let len = this._projectiles.length;
		for(let i = 0; i < len; i++) {
			if(this._projectiles[i].update()) {
				const p = this._projectiles[i];
				this._projectiles.splice(i, 1);
				ProjectileObjectPool.removeObject(p);
				i--;
				len--;
			}
		}
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
