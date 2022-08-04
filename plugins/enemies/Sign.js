class SignEnemy extends EnemyBase {
	constructor(tileX, tileY, onDefeat = null) {
		super(tileX, tileY, onDefeat);

		this._continueBehavior = false;
		this.generateIdleTime();
	}

	generateIdleTime() {
		this._idleTime = 50 + Math.floor(Math.random() * 50);
	}

	getMaxHp() {
		return 180;
	}

	bodyDamage() {
		return 10;
	}

	exp() {
		return 200;
	}

	noticeDistance() {
		return 360;
	}

	forgetDistance() {
		return 500;
	}

	setupCollisionRect() {
		this.colRect = { left: 9, right: 9, top: 20, bottom: 9 };
	}

	setupAnimations() {
		this._setupAnimationsFromName("Sign", 1, 999, 2, 5, 1, 999);
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
		if(this.time === 40) {
			this.setDirectionToPlayer(0.05);
			this.speed = 2;
			//this.playAttackSe();
		}
		if(this._attackType) {
			if(this.time > 40 && this.time < 100 && this.time % 10 === 0) {
				this.playAttackSe();
			}
			if(this.time > 40 && this.time < 100 && this.time % 4 === 0) {
				const dir = this.getDirectionToPlayer() + ((this.time - 75) / 25) * Math.PI * 0.2;
				this.shootProjectile(dir);

				this.playShootSe();
			}
		} else {
			if(this.time > 40 && this.time < 100 && this.time % 10 === 0) {
				this.playAttackSe();
			}
			if(this.time > 40 && this.time < 100 && this.time % 10 === 0) {
				const dir = this.getDirectionToPlayer();

				for(let i = -5; i <= 5; i++) {
					this.shootProjectile(dir + ((i / 5) * Math.PI * 0.3));
				}

				this.playShootSe();
			}
		}
		if(this.time > 120) {
			this.speed = 0;
			if(this.time === 180) {
				this._attackType = !!this._attackType ? 0 : 1;
				this.time = 0;
				this.checkDespawn();
			}

			if(!this.noticedPlayer) {
				this._continueBehavior = false;
			}
		}
	}

	behaveIdle() {
		this.speed = 4;
		//this.time = 0;
		if(this.time === 5) {
			this.checkDespawn();
			this.direction += (Math.PI * (-0.3 + (Math.random() * 0.6)));
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
		this.time = 40;
		this.speed = 0;
	}

	onDamageKnockbackComplete() {
		this.time = 30;
		this.speed = 0;
	}
}