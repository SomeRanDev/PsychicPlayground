class Omom extends EnemyBase {
	constructor(tileX, tileY, onDefeat = null) {
		super(tileX, tileY, onDefeat);

		this._continueBehavior = false;
		this._hitPlayerKnockback = 0;
	}

	getMaxHp() {
		return 30;
	}

	bodyDamage() {
		return 20;
	}

	exp() {
		return 50;
	}

	noticeDistance() {
		return 140;
	}

	setupCollisionRect() {
		this.colRect = { left: 9, right: 9, top: 14, bottom: 9 };
	}

	setupAnimations() {
		this._setupAnimationsFromName("Omom", 4, 12, 4, 6, 1, 999);
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
		this.checkStopAttacking();
	}

	checkStopAttacking() {
		if(!this.noticedPlayer) {
			this._continueBehavior = false;
		}
	}

	behaveIdle() {
		if(this.time === 40) {
			this.randomizeDir();
			this.speed = 1.5;
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
		this.speed = 0;
	}
}