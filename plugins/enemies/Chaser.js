class Chaser extends EnemyBase {
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