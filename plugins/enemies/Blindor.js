class Blindor extends EnemyBase {
	constructor(tileX, tileY, onDefeat = null) {
		super(tileX, tileY, onDefeat);

		this._continueBehavior = false;
		this._hitPlayerKnockback = 0;
	}

	getMaxHp() {
		return 20;
	}

	bodyDamage() {
		return 10;
	}

	exp() {
		return 30;
	}

	noticeDistance() {
		return 160;
	}

	setupCollisionRect() {
		this.colRect = { left: 9, right: 9, top: 36, bottom: 9 };
	}

	setupAnimations() {
		/*const e = "Blindor";
		this.idleAni = this.buildAnimation(e + "_IdleFront", e + "_IdleBack", 4, 12);
		this.walkAni = this.buildAnimation(e + "_WalkFront", e + "_WalkBack", 4, 5);
		this.damageAni = this.buildAnimation(e + "_DamageFront", e + "_DamageBack", 1, 999);
		*/
		this._setupAnimationsFromName("Blindor", 4, 12, 4, 5, 1, 999);
	}

	updateBehavior() {
		if(this._hitPlayerKnockback > 0) {
			const r = this._hitPlayerKnockback / 90;
			this.speed = (-2 * r.cubicIn());
			this.direction = this._hitPlayerDir;
			this._hitPlayerKnockback--;
			this.checkStopAttacking();
			return;
		}
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
		if(this.time % 5 === 0) {
			this.setDirectionToPlayer(0.05);
			this.speed = 4;
		}
		this.checkStopAttacking();
	}

	checkStopAttacking() {
		if(!this.noticedPlayer) {
			this._continueBehavior = false;
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

	onHitPlayerWithBody() {
		this._hitPlayerKnockback = 90;
		this._hitPlayerDir = this.direction;
		this.speed = -2;
	}
}