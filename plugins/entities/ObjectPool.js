
class ObjectPool {
	objects = [];
	classObj = null;

	constructor(classObj) {
		this.classObj = classObj;
	}

	getObject() {
		let obj;
		if(this.objects.length > 0) {
			obj = this.objects.pop();
			obj.init.apply(obj, arguments);
		} else if(this.classObj !== null) {
			obj = new this.classObj(...arguments);
		}
		return obj;
	}

	removeObject(obj) {
		obj.onPoolRemove();
		this.objects.push(obj);
	}

	clear() {
		for(const o of this.objects) {
			o.onPoolClear();
		}
		this.objects = [];
	}
}

function ClearAllObjectPools() {
	MineableObjectPool.clear();
	ProjectileObjectPool.clear();
	EnemyProjectileObjectPool.clear();
	HeartObjectPool.clear();
}

const MineableObjectPool = new ObjectPool(Mineable);
const ProjectileObjectPool = new ObjectPool(Projectile);
const EnemyProjectileObjectPool = new ObjectPool(EnemyProjectile);
const HeartObjectPool = new ObjectPool(Heart);
