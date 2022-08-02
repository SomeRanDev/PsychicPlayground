class Chaser extends EnemyBase {
	constructor(tileX, tileY, onDefeat = null) {
		super(tileX, tileY, onDefeat);

		this._continueBehavior = false;
	}

	getMaxHp() {
		return 12;
	}

	bodyDamage() {
		return 10;
	}

	exp() {
		return 10;
	}

	noticeDistance() {
		return 120;
	}

	setupCollisionRect() {
		this.colRect = { left: 9, right: 9, top: 6, bottom: 9 };
	}

	setupAnimations() {
		this.idleAni = this.buildAnimation("Blump_IdleFront", "Blump_IdleBack", 12, 12);
		this.walkAni = this.buildAnimation("Blump_WalkFront", "Blump_WalkBack", 2, 5);
		this.damageAni = this.buildAnimation("Blump_DamageFront", "Blump_DamageBack", 1, 999);
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
		if(this.time === 90) {
			this.setDirectionToPlayer(0.05);
			this.speed = 4;
		}
		if(this.time === 120) {
			this.speed = 0;
			this.time = 0;
			if(!this.noticedPlayer) {
				this._continueBehavior = false;
			}
		}
	}

	behaveIdle() {
		if(this.time === 90) {
			this.randomizeDir();
			this.speed = 2;
			this._final = 100 + Math.floor(Math.random() * 30);
		}
		if(this.time === this._final) {
			this.speed = 0;
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
		this.time = 0;
		this.speed = 0;
	}

	onDamageKnockbackComplete() {
		this.time = 30;
		this.speed = 0;
	}
}