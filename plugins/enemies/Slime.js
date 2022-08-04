class Slime extends EnemyBase {
	constructor(tileX, tileY, onDefeat = null) {
		super(tileX, tileY, onDefeat);

		this._continueBehavior = false;
		this.generateIdleTime();
	}

	generateIdleTime() {
		this._idleTime = 50 + Math.floor(Math.random() * 50);
	}

	getMaxHp() {
		return 100;
	}

	bodyDamage() {
		return 30;
	}

	exp() {
		return 70;
	}

	noticeDistance() {
		return 160;
	}

	forgetDistance() {
		return 240;
	}

	setupCollisionRect() {
		this.colRect = { left: 9, right: 9, top: 20, bottom: 9 };
	}

	setupAnimations() {
		this._setupAnimationsFromName("Slime", 3, 12, 3, 7, 1, 999);
	}

	updateBehavior() {
		if(this.time === 1) {
			this.checkDespawn();
		}
		if(this._continueBehavior) {
			this.behaveAttack();
		} else {
			this.behaveIdle();
		}
	}

	behaveAttack() {
		if(this.time === 80) {
			this.setDirectionToPlayer(0.05);
			this.speed = 4;
			this.playAttackSe();
		}
		if(this.time > 80 && this.time < 140 && this.time % 10 === 0) {
			this.playAttackSe();
		}
		if(this.time > 80 && this.time < 140 && this.time % 18 === 0) {
			const dir = this.getDirectionToPlayer();
			for(let i = -8; i <= 8; i++) {
				this.shootProjectile(dir + (Math.PI * 0.5 * (i / 8)));
			}

			this.playShootSe();
		}
		if(this.time > 140) {
			this.speed = 0;
			if(this.time === 160) this.time = 0;

			if(!this.noticedPlayer) {
				this._continueBehavior = false;
			}
		}
	}

	behaveIdle() {
		this.speed = 2;
		//this.time = 0;
		if(this.time === 5) {
			this.checkDespawn();
			this.direction += (Math.PI * (-0.2 + (Math.random() * 0.4)));
			this.time = 0;
		}
	}

	onNotice() {
		this._continueBehavior = true;
		this.time = 60;
		this.speed = 0;
		this.setDirectionToPlayer();
	}

	onDamage() {
		super.onDamage();
		this.time = 70;
		this.speed = 0;
	}

	onDamageKnockbackComplete() {
		this.time = 30;
		this.speed = 0;
	}
}