
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
}

const MineableObjectPool = new ObjectPool(Mineable);
const ProjectileObjectPool = new ObjectPool(Projectile);
const HeartObjectPool = new ObjectPool(Heart);
