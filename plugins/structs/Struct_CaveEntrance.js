class Struct_CaveEntrance extends Struct_Base {
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
		return [-1, -1, 3, 2];
	}

	clearSize() {
		return [-2, -2, 5, 3];
	}

	backOffset() {
		return [0, 8];
	}

	setupCustomCollisionResponses(globalX, globalY) {
		CollisionManager.clearStructCollision(globalX, globalY);
		CollisionManager.addTransfer(globalX, globalY, {
			id: 7, x: 17, y: 1, dir: 8, fadeType: 0
		});
	}
}

class Struct_CaveEntrance_Intro extends Struct_CaveEntrance {
	constructor(id) {
		super(id, "OrbCave_Grass_Front", "OrbCave_Grass_Back");
	}

	setupCustomCollisionResponses(globalX, globalY) {
		CollisionManager.clearStructCollision(globalX, globalY);
		CollisionManager.addTransfer(globalX, globalY, {
			id: 7, x: 17, y: 1, dir: 8, fadeType: 0
		});
	}
}

class Struct_CaveEntrance_RedOrb extends Struct_CaveEntrance {
	constructor(id) {
		super(id, "OrbCave_Grass_Front", "OrbCave_Grass_Back");
	}

	setupCustomCollisionResponses(globalX, globalY) {
		CollisionManager.clearStructCollision(globalX, globalY);
		CollisionManager.addTransfer(globalX, globalY, {
			id: 8, x: 17, y: 1, dir: 8, fadeType: 0
		});
	}
}

class Struct_CaveEntrance_GreenOrb extends Struct_CaveEntrance {
	constructor(id) {
		super(id, "OrbCave_Grass_Front", "OrbCave_Grass_Back");
	}

	setupCustomCollisionResponses(globalX, globalY) {
		CollisionManager.clearStructCollision(globalX, globalY);
		CollisionManager.addTransfer(globalX, globalY, {
			id: 9, x: 17, y: 1, dir: 8, fadeType: 0
		});
	}
}

class Struct_CaveEntrance_BlueOrb extends Struct_CaveEntrance {
	constructor(id) {
		super(id, "OrbCave_Grass_Front", "OrbCave_Grass_Back");
	}

	setupCustomCollisionResponses(globalX, globalY) {
		CollisionManager.clearStructCollision(globalX, globalY);
		CollisionManager.addTransfer(globalX, globalY, {
			id: 10, x: 17, y: 1, dir: 8, fadeType: 0
		});
	}
}

class Struct_CaveEntrance_FastTravel extends Struct_CaveEntrance {
	constructor(id) {
		super(id, "FastTravel_Front", "FastTravel_Back");
	}

	size() {
		return [-1, -2, 3, 3];
	}

	clearSize() {
		return [-2, -3, 5, 5];
	}

	setupCustomCollisionResponses(globalX, globalY) {
		CollisionManager.clearStructCollision(globalX, globalY);
		CollisionManager.addTransfer(globalX, globalY, {
			id: 13, x: 13, y: 19, dir: 2, fadeType: 0
		});
	}
}
