class Chaser extends EnemyBase {
	getMaxHp() {
		return 3;
	}

	setupCollisionRect() {
		this.colRect = { left: 9, right: 9, top: 6, bottom: 9 };
	}

	setupAnimations() {
		this.idleAni = {
			front: "Blump_IdleFront",
			back: "Blump_IdleBack",
			frameCount: 12,
			speed: 12
		};

		this.walkAni = {
			front: "Blump_WalkFront",
			back: "Blump_WalkBack",
			frameCount: 2,
			speed: 5
		};

		this.damageAni = {
			front: "Blump_DamageFront",
			back: "Blump_DamageBack",
			frameCount: 1,
			speed: 999
		};
	}

	setupSprite() {
		super.setupSprite();

		this.sprite.bitmap = ImageManager.loadEnemy("Test");
	}

	updateBehavior() {
		if(this.time === 90) {
			this.setDirectionToPlayer();
			this.speed = 4;
		}
		if(this.time === 110) {
			this.speed = 0;
			this.time = 0;

			this.shootProjectile(90, "Teleport");
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