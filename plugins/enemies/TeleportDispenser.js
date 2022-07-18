window.TeleportDispenser = class TeleportDispenser {
	constructor(x, y, teleportPos) {
		this.x = x;
		this.y = y;
		this._projectiles = [];

		this._teleportPos = teleportPos;

		this._shootFreq = 0;

		$gameTemp.enemies.push(this);
	}

	update() {
		this._shootFreq++;
		if(this._shootFreq > 10) {
			this._shootFreq = 0;
			const p = EnemyProjectileObjectPool.getObject(this.x, this.y, 90, "Teleport");
			this._projectiles.push(p);
			p.onPlayerHit = (player) => {
				player.teleport(this._teleportPos);
			};
		}

		let len = this._projectiles.length;
		for(let i = 0; i < len; i++) {
			if(this._projectiles[i].update()) {
				const p = this._projectiles[i];
				this._projectiles.splice(i, 1);
				EnemyProjectileObjectPool.removeObject(p);
				i--;
				len--;
			}
		}
	}
}
