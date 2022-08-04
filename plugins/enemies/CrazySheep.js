class CrazySheep extends EnemyBase {
	constructor(tileX, tileY, onDefeat = null) {
		super(tileX, tileY, onDefeat);

		this._continueBehavior = false;
		this._hitPlayerKnockback = 0;
	}

	getMaxHp() {
		return 8;
	}

	bodyDamage() {
		return 5;
	}

	exp() {
		return 20;
	}

	noticeDistance() {
		return 180;
	}

	setupCollisionRect() {
		this.colRect = { left: 9, right: 9, top: 18, bottom: 9 };
	}

	setupAnimations() {
		/*const e = "CrazySheep";
		this.idleAni = this.buildAnimation(e + "_IdleFront", e + "_IdleBack", 4, 12);
		this.walkAni = this.buildAnimation(e + "_WalkFront", e + "_WalkBack", 2, 4);
		this.damageAni = this.buildAnimation(e + "_DamageFront", e + "_DamageBack", 1, 999);
		*/

		this._setupAnimationsFromName("CrazySheep", 4, 16, 2, 6, 1, 999);
	}

	updateBehavior() {
		if(this.time === 1) {
			this.checkDespawn();
		}
		if(this._rest > 0) {
			this._rest--;
			return;
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
		if(this.getDistanceToPlayer() < 20) {
			this._rest = 90;
			this.speed = 2;
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
			this.speed = 1.5;
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
		this.playDashSe();
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

	onHitPlayerWithBody() {
		this._rest = 90;
		this.speed = 0.5;
	}
}