class Chaser extends EnemyBase {
	getMaxHp() {
		return 3;
	}

	bodyDamage() {
		return 10;
	}

	exp() {
		return 10;
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
		if(this.time === 90) {
			this.setDirectionToPlayer();
			this.speed = 4;
		}
		if(this.time === 110) {
			this.speed = 0;
			this.time = 0;

			//const p = this.shootProjectile(90, "Attack");
			//p.startAnimationSpeed = 0.2;
		}
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