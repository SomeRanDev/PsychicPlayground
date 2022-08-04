class Mimic extends EnemyBase {
	constructor(tileX, tileY, onDefeat = null) {
		super(tileX, tileY, onDefeat);

		this._continueBehavior = false;
		this.generateIdleTime();
	}

	generateIdleTime() {
		this._idleTime = 50 + Math.floor(Math.random() * 50);
	}

	getMaxHp() {
		return 12;
	}

	bodyDamage() {
		return 25;
	}

	exp() {
		return 30;
	}

	noticeDistance() {
		return 200;
	}

	forgetDistance() {
		return 280;
	}

	setupCollisionRect() {
		this.colRect = { left: 9, right: 9, top: 20, bottom: 9 };
	}

	setupAnimations() {
		this._setupAnimationsFromName("Mimic", 6, 16, 2, 4, 1, 999);
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
		if(this.time === 60) {
			this.setDirectionToPlayer(0.05);
			this.speed = 2;
			this.playAttackSe();
		}
		if(this.time > 60 && this.time % 10 === 0) {
			this.playAttackSe();
		}
		if(this.time === 90) {
			this.speed = 0;
			this.time = 0;

			const dir = this.getDirectionToPlayer();
			//this.shootProjectile(dir);
			for(let i = -3; i <= 3; i++) {
				this.shootProjectile(dir + (Math.PI * 0.2 * (i / 3)));
			}

			this.playShootSe();

			if(!this.noticedPlayer) {
				this._continueBehavior = false;
			}
		}
	}

	behaveIdle() {
		this.speed = 0;
		//this.time = 0;
		if(this.time === 10) {
			this.checkDespawn();
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
		this.time = 0;
		this.speed = 0;
	}

	onDamageKnockbackComplete() {
		this.time = 30;
		this.speed = 0;
	}
}