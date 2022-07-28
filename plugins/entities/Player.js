
class Player {
	constructor() {
		//this.position = new Vector2(0, 0);
		this.moving = false;

		this._walkTime = 0;

		this.TURN_RATE = 9.0;

		this.targetDirection = 0;
		this.currentDirection = 0;
		this.lastAngle = 0;

		this.spriteOffsetX = 0;
		this.spriteOffsetY = 0;

		this.canPlaceMaterial = false;

		this.shootFrequency = 24;
		this._projectiles = [];
		this._projectileTime = 0;
		this._projectileTriggeredTime = 0;

		this._collisionRect = { left: 6, right: 6, bottom: 0, top: 12 };

		this._lastOverworldX = 0;
		this._lastOverworldY = 1;

		this.fastTravelSpots = [];

		this.powerStat = 1;
		this.speedStat = 1;
		this.aimingStat = 1;
		this.breakingStat = 1;
		this.makingStat = 1;

		this.exp = 0;
		this.level = 1;
		this.statPoints = 0;

		this.hp = 80;
		this.maxHp = 80;
		this.hunger = 80;
		this.maxHunger = 80;

		this.inventory = new Inventory();

		// --- no save ---

		this._damageTime = 0;
		this._damageDirection = 0;
		this._damageKnockback = 0;

		this._invincibilityTime = 0;
	}

	makeSprite() {
		this.sprite = new PlayerSprite(this);
		return this.sprite;
	}

	setAllStats(allStats) {
		this.powerStat = allStats[0];
		this.speedStat = allStats[1];
		this.aimingStat = allStats[2];
		this.breakingStat = allStats[3];
		this.makingStat = allStats[4];
	}

	getStatFromIndex(index) {
		switch(index) {
			case 0: return this.powerStat;
			case 1: return this.speedStat;
			case 2: return this.aimingStat;
			case 3: return this.breakingStat;
			case 4: return this.makingStat;
		}
		return 0;
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

	refreshInventorySlots() {
		if(this.sprite) {
			this.sprite._hotbar.refreshInventoryListSlots();
		}
	}

	loadData(data) {
		this.position = new Vector2(data.position.x, data.position.y);

		this.moving = data.moving;

		this._walkTime = data._walkTime;

		this.hp = data.hp;

		this.TURN_RATE = data.TURN_RATE;

		this.targetDirection = data.targetDirection ?? 0;
		this.currentDirection = data.currentDirection ?? 0;
		this.lastAngle = data.lastAngle ?? 0;

		this.spriteOffsetX = data.spriteOffsetX ?? 0;
		this.spriteOffsetY = data.spriteOffsetY ?? 0;

		this.canPlaceMaterial = data.canPlaceMaterial ?? false;

		this.shootFrequency = data.shootFrequency ?? 24;
		this._projectiles = data._projectiles ?? [];
		this._projectileTime = data._projectileTime ?? 0;
		this._projectileTriggeredTime = data._projectileTriggeredTime ?? 0;

		this._collisionRect = data._collisionRect;

		this._lastOverworldX = data._lastOverworldX;
		this._lastOverworldY = data._lastOverworldY;

		this.fastTravelSpots = data.fastTravelSpots;

		this.powerStat = data.powerStat ?? 1;
		this.speedStat = data.speedStat ?? 1;
		this.aimingStat = data.aimingStat ?? 1;
		this.breakingStat = data.breakingStat ?? 1;
		this.makingStat = data.makingStat ?? 1;

		this.hp = data.hp ?? 80;
		this.maxHp = data.maxHp ?? 80;
		this.hunger = data.hunger ?? 80;
		this.maxHunger = data.maxHunger ?? 80;

		this.inventory.loadData(data.inventory);
	}

	saveData() {
		const result = {};

		result.position = { x: this.position.x, y: this.position.y };
		result.moving = this.moving;

		result._walkTime = this._walkTime;

		result.hp = this.hp;

		result.TURN_RATE = this.TURN_RATE;

		result.targetDirection = this.targetDirection;
		result.currentDirection = this.currentDirection;
		result.lastAngle = this.lastAngle;

		result.spriteOffsetX = this.spriteOffsetX;
		result.spriteOffsetY = this.spriteOffsetY;

		result.canPlaceMaterial = this.canPlaceMaterial;

		result.shootFrequency = this.shootFrequency;
		result._projectiles = this._projectiles;
		result._projectileTime = this._projectileTime;
		result._projectileTriggeredTime = this._projectileTriggeredTime;

		result._collisionRect = this._collisionRect;

		result._lastOverworldX = this._lastOverworldX;
		result._lastOverworldY = this._lastOverworldY;

		result.fastTravelSpots = this.fastTravelSpots;

		result.fastTravelSpots = [];

		result.powerStat = this.powerStat;
		result.speedStat = this.speedStat;
		result.aimingStat = this.aimingStat;
		result.breakingStat = this.breakingStat;
		result.makingStat = this.makingStat;

		result.hp = this.hp;
		result.maxHp = this.maxHp;
		result.hunger = this.hunger;
		result.maxHunger = this.maxHunger;

		result.inventory = this.inventory.saveData();

		return result;
	}

	allowMapHud() {
		return $gameMap.isGenerated() && this.inventory.hasItem(0);
	}

	selectMineables() {
		return this.inventory.isMining();
	}

	showMapCursor() {
		return this.inventory.isMaterial() && this.canMove();
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

	showPopupEx(text, color) {
		this.sprite.addTextEx(text, color);
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

	teleport(teleportPos) {
		if(!this.playerEffect) {
			this.playerEffect = new TeleportEffect(this, teleportPos);
		}
	}

	hopOnBed() {
		if(!this.playerEffect) {
			this.playerEffect = new BedEffect(this, {
				x: ($gameTemp.currentlyRunning.x * TS) + (TS * 0.5),
				y: $gameTemp.currentlyRunning.y * TS + (TS * 1.5)
			});
		}
	}

	leaveBed() {
		this.playerEffect = new BedLeaveEffect(this);
	}

	damageEffect() {
		this.playerEffect = new DamageEffect(this);
	}

	healEffect() {
		this.playerEffect = new HealEffect(this);
	}

	deathEffect() {
	}

	removeEffect(effect) {
		if(this.playerEffect === effect) {
			this.playerEffect = null;
		}
	}

	moveTo(x, y) {
		this.position.x = x;
		this.position.y = y;
	}

	shift(x, y) {
		this.position.x += x;
		this.position.y += y;
	}

	update() {
		this.inventory.update();
		if(this.playerEffect) {
			this.playerEffect.update();
		}
		this.updateMovement();
		this.updateProjectileInput();
		this.updateProjectiles();
		this.updateItemInput();
		this.updateInvincibility();
	}

	enableTileCursorPlacement(b) {
		this.canPlaceMaterial = b;
	}

	canMove() {
		return !($gameMap.isEventRunning() || $gameMessage.isBusy() || $gamePlayer.isTransferring() || this.playerEffect?.disallowMovement);
	}

	calcExtraDamage() {
		return (this.powerStat) * 0.25;
	}

	calcSpeed() {
		return 2 + (this.speedStat * 0.2);
	}

	calcShootFrequency() {
		return Math.floor(24 - (this.speedStat * 0.5)).clamp(4, 999);
	}

	calcProjectileRotationSpeed() {
		return 8 + (this.aimingStat * 0.25);
	}

	calcProjectileAccuracy() {
		return Math.round(12 - (this.aimingStat * 0.1));
	}

	calcMiningSpeed() {
		return 0.06 + (this.breakingStat * 0.001);
	}

	calcBuildCost(normalBuildCost) {
		return Math.round(normalBuildCost - (this.makingStat)).clamp(1, 999);
	}

	updateMovement() {
		this.moving = this.isMoving();
		const lastDirection = this.currentDirection;

		if((this.moving || this._damageTime > 0) && this.canMove()) {
			this.updateTargetDirection();

			let isKnockback = false;
			if(this._damageTime > 0) {
				this._damageTime--;
				isKnockback = true;
				if(this._damageTime <= 0) {
					this.onDamageKnockbackComplete();
				}
			}

			this._walkTime += 1;

			let speed = this.calcSpeed();
			let inputX = Input.InputVector.x;
			let inputY = Input.InputVector.y;

			if(isKnockback) {
				speed = this._damageKnockback;
				inputX = Math.cos(this._damageDirection);
				inputY = Math.sin(this._damageDirection);
			}

			CollisionManager.setPlayerCollisionCheck();

			let sx = this.position.x;
			let sy = this.position.y;
			const colRect = this._collisionRect;

			
			if(inputX < 0) {
				sx -= colRect.left;
			} else if(inputX > 0) {
				sx += colRect.right;
			}
			if(inputX !== 0) {
				const newPosX = CollisionManager.processMovementX(sx, sy + colRect.bottom, (speed * inputX));
				const newPosX2 = CollisionManager.processMovementX(sx, sy - colRect.top, (speed * inputX));
				const finalX = inputX < 0 ? (Math.max(newPosX, newPosX2) + colRect.left) : (Math.min(newPosX, newPosX2) - colRect.left);
				this.position.x = Math.round(finalX);
			}

			sx = this.position.x;
			if(inputY < 0) {
				sy -= colRect.top;
			} else if(inputY > 0) {
				sy += colRect.bottom;
			}
			if(inputY !== 0) {
				const newPosY = CollisionManager.processMovementY(sx - colRect.left, sy, (speed * inputY));
				const newPosY2 = CollisionManager.processMovementY(sx + colRect.right, sy, (speed * inputY));
				const finalY = inputY < 0 ? (Math.max(newPosY, newPosY2) + colRect.top) : (Math.min(newPosY, newPosY2) - colRect.bottom);
				this.position.y = Math.round(finalY);
			}

			const tileX = Math.floor(this.position.x / TS);
			const tileY = Math.floor(this.position.y / TS);
			if(CollisionManager.checkForResponse(tileX, tileY)) {
				if($gameMap.isGenerated()) {
					this._lastOverworldX = tileX;
					this._lastOverworldY = tileY;
				}
			}
		} else {
			this._walkTime = 0;
		}

		this.updateTurning(lastDirection);
	}

	isMoving() {
		return Input.InputVector.length() > 0;
	}

	setMZDir(dir) {
		switch(dir) {
			case 2: return this.lookUp();
			case 8: return this.lookDown();
		}
	}

	lookUp() {
		this.setDirection(90);
	}

	lookDown() {
		this.setDirection(270);
	}

	setDirection(d) {
		this.currentDirection = d;
		this.targetDirection = d;
		this.updateTurning(9999);
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
		if(!this.canMove()) {
			this._pressedWhileUnavailable = TouchInput.isPressed();
			return;
		} else if(this._pressedWhileUnavailable) {
			if(TouchInput.isPressed()) {
				return;
			} else {
				this._pressedWhileUnavailable = false;
			}
		}

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
			if(this._projectileTime++ > this.calcShootFrequency()) {
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
				materialData.damage + this.calcExtraDamage(),
				180,
				{
					directionRefreshAcc: this.calcProjectileAccuracy(),
					rotateSpeed: this.calcProjectileRotationSpeed()
				}
			);
			this._projectiles.push(projectile);
			projectile.owner = this;

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

	checkProjectile(projectile, x, y) {
		if(this.isInvincible()) {
			return false;
		}

		const x1 = this.position.x - this._collisionRect.left;
		const x2 = this.position.x + this._collisionRect.right;
		const y1 = this.position.y - this._collisionRect.top;
		const y2 = this.position.y + this._collisionRect.bottom;
		const r = projectile.radius;

		const xn = Math.max(x1, Math.min(x, x2));
		const yn = Math.max(y1, Math.min(y, y2));
		const dx = xn - x;
		const dy = yn - y;

		if((dx * dx + dy * dy) <= r * r) {
			if(projectile.onPlayerHit) {
				projectile.onPlayerHit(this);
			}
			return true;
		}
		return false;
	}

	updateItemInput() {
		if(TouchInput.isTriggered()) {
			const itemBehavior = this.inventory.hasUsableItem();
			if(itemBehavior) {
				if(!itemBehavior()) {
					this.inventory.consumeHotbarItem();
				}
			}
		}
	}

	updateInvincibility() {
		if(this._invincibilityTime > 0) {
			this._invincibilityTime--;

			const tone = this._invincibilityTime % 16 > 8 ? [-60, -60, -60, 60] : [0, 0, 0, 0];
			this.sprite.setColorTone(tone);
		}
	}

	isInvincible() {
		return this._invincibilityTime > 0;
	}

	takeDamage(amount, direction, knockbackTime = 8, knockbackSpeed = 4) {
		this.addHp(-amount);
		if(this.hp === 0) {
			this.onKill();
			this.deathEffect();
		} else {
			this._invincibilityTime = 64;
			this._damageTime = knockbackTime;
			this._damageDirection = direction;
			this._damageKnockback = knockbackSpeed;
			this.damageEffect();
		}
	}

	onKill() {
	}

	onDamageKnockbackComplete() {
	}

	collisionBox() {
		return {
			left: this.position.x - this._collisionRect.left,
			right: this.position.x + this._collisionRect.right,
			top: this.position.y - this._collisionRect.top,
			bottom: this.position.y + this._collisionRect.bottom
		};
	}

	setHp(hp) {
		this.hp = hp.clamp(0, this.maxHp);
		this.onHpChange();
	}

	addHp(hp) {
		this.setHp(this.hp + hp);
	}

	setHunger(hunger) {
		this.hunger = hunger.clamp(0, this.maxHunger);
		this.onHungerChange();
	}

	addHunger(hunger) {
		this.setHunger(this.hunger + hunger);
	}

	onHpChange() {
		this.sprite.onHpChange();
	}

	onMaxHpChange() {
		this.sprite.onMaxHpChange();
	}

	onHungerChange() {
		this.sprite.onHungerChange();
	}

	onMaxHungerChange() {
		this.sprite.onMaxHungerChange();
	}

	incrementMaxHp() {
		this.maxHp += 10;
		this.hp = this.maxHp;
		this.onMaxHpChange();
		this.onHpChange();
	}

	incrementMaxHunger() {
		this.maxHunger += 10;
		this.hunger = this.maxHunger;
		this.onMaxHungerChange();
		this.onHungerChange();
	}

	addHpFromItem(hp) {
		if(hp === 0) return;
		this.addHp(hp);
		if(hp > 0) {
			this.healEffect();
			this.showPopupEx("+" + Math.floor(hp / 10) + " Hearts", 0xbbffdd);
		} else {
			this.damageEffect();
			this.showPopupEx("-" + Math.floor(hp / -10) + " Hearts", 0xffbbdd);
		}
	}

	addHungerFromItem(hunger) {
		if(hunger === 0) return;
		this.addHunger(hunger);
		if(hunger > 0) {
			if(!this.playerEffect) this.healEffect();
			this.showPopupEx("+" + Math.floor(hunger / 10) + " Hunger", 0xbbffdd);
		} else {
			if(!this.playerEffect) this.damageEffect();
			this.showPopupEx("-" + Math.floor(hunger / -10) + " Hunger", 0xffbbdd);
		}
	}

	addExp(exp) {
		if(exp <= 0) return;

		let _exp = exp;
		let levelsGained = 0;
		let maxExp = this.maxExp();
		while(this.exp + _exp >= maxExp) {
			_exp -= (maxExp - this.exp);
			this.exp = 0;
			levelsGained++;
			maxExp = this.maxExp(this.level + levelsGained);
		}
		this.exp += _exp;
		if(levelsGained > 0) {
			this.addLevels(levelsGained);
		}
		this.onExpChange();

		this.showPopupEx("+" + exp + " EXP", 0xbbffdd);
		if(levelsGained > 0) {
			const lvlText = "+" + levelsGained + " Level" + (levelsGained === 1 ? "" : "s");
			this.showPopupEx(lvlText, 0xbbddff);
		}
	}

	expRatio() {
		return this.exp / this.maxExp();
	}

	addLevels(levels) {
		if(levels <= 0) return;

		this.level += levels;
		this.statPoints += levels;

		this.onLevelChange();
	}

	maxExp(level) {
		level = level ?? this.level;
		if(level <= 5) {
			return 20;
		} else if(level <= 10) {
			return 50;
		} else if(level <= 15) {
			return 75;
		}
		return 100;
	}

	onExpChange() {
		this.sprite._healthHud.refreshExp();
	}

	onLevelChange() {
	}

	addFastTravelSpot() {
		const newX = this._lastOverworldX;
		const newY = this._lastOverworldY;

		let canAdd = this.fastTravelSpots.length <= 0;
		if(!canAdd) {
			let exists = false;
			for(const spot of this.fastTravelSpots) {
				if(Math.abs(spot[0] - newX) < 3 && Math.abs(spot[1] - newY) < 3) {
					exists = true;
					break;
				}
			}

			canAdd = !exists;
		}

		if(canAdd)  {
			this.fastTravelSpots.push([newX, newY, $generation.getLocationName(newX, newY)]);
			return true;
		}

		return false;
	}

	canFastTravel() {
		return this.fastTravelSpots?.length > 1;
	}

	mostRecentTravelSpot() {
		if(this.fastTravelSpots.length <= 0) {
			return "";
		}
		return this.fastTravelSpots[this.fastTravelSpots.length - 1][2];
	}

	setFastTravelIndex(i) {
		const spot = this.fastTravelSpots[i];
		this._lastOverworldX = spot[0];
		this._lastOverworldY = spot[1];

		$gameVariables.setValue(26, spot[2]);
	}

	setupFastTravelChoices(interpreter) {
		$gameMessage.add("\"Gree\\..\\..\\.. tings, \\!where do you want to travel?\"");

		$gameMessage.setChoices(this.fastTravelSpots.map((c, i) => ((i + 1) + ") " + c[2])), 0, -2);
		$gameMessage.setChoiceBackground(0);
		$gameMessage.setChoicePositionType(3);
		$gameMessage.setChoiceCallback(n => {
			$ppPlayer.setFastTravelIndex(n);
		});

		interpreter.setWaitMode("message");
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
