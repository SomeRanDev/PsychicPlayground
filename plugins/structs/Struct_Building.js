class Struct_Building extends Struct_Base {
	constructor(id, imgFront, imgBack) {
		super(id);
		this.imgFront = imgFront;
		this.imgBack = imgBack;
	}

	imgPath() {
		return this.imgFront;
	}

	backImgPath() {
		return this.imgBack;
	}

	size() {
		return [-4, -5, 9, 6];
	}

	clearSize() {
		return [-4 - 3, -5 - 3, 9 + 6, 6 + 6];
	}

	backOffset() {
		return [-32, 100];
	}

	setupCustomCollisionResponses(globalX, globalY) {
		CollisionManager.clearStructCollision(globalX, globalY);
		CollisionManager.addTransfer(globalX, globalY, {
			id: 7, x: 17, y: 1, dir: 8, fadeType: 0
		});
	}
}

class Struct_Building_Map extends Struct_Building {
	constructor(id) {
		super(id, "MapStore_Front", "MapStore_Back");
	}

	setupCustomCollisionResponses(globalX, globalY) {
		CollisionManager.clearStructCollision(globalX, globalY);
		CollisionManager.addTransfer(globalX, globalY, {
			id: 11, x: 14, y: 19, dir: 2, fadeType: 0
		});
	}
}

class Struct_Building_Food extends Struct_Building {
	constructor(id) {
		super(id, "FoodStore_Front", "FoodStore_Back");
	}

	setupCustomCollisionResponses(globalX, globalY) {
		CollisionManager.clearStructCollision(globalX, globalY);
		CollisionManager.addTransfer(globalX, globalY, {
			id: 12, x: 14, y: 19, dir: 2, fadeType: 0
		});
	}
}
