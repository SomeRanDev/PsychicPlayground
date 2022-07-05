
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
		obj.destroy();
		this.objects.push(obj);
	}
}

const WallObjectPool = new ObjectPool(Wall);
