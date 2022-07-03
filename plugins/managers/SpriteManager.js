

modify_Spriteset_Map = class {
	initialize() {
		this._cameraTargetX = 0;
		this._cameraTargetY = 0;

		PP.Spriteset_Map.initialize.apply(this, arguments);
	}

	createPPLayer() {
		this._ppLayer = new Sprite();
		this._tilemap.addChild(this._ppLayer);
	}

	createCharacters() {
		PP.Spriteset_Map.createCharacters.apply(this, arguments);

		for(const sprite of this._characterSprites) {
			this._tilemap.removeChild(sprite);
		}
		this._characterSprites = [];

		this.createPPLayer();
		this._ppEntities = [];
		for(let i = 0; i < SpriteManager.entities.length; i++) {
			const e = SpriteManager.entities[i];
			const spr = e.makeSprite();
			this._ppEntities.push(spr);
			this._ppLayer.addChild(spr);
		}
	}

	//==============================
	// Camera stuff
	//==============================
	lerp(a, b, x) {
		if(Math.abs(a - b) < 0.1) return b;
		return a + (b - a) * x;
	}

	canMoveCamera() {
		return true;
	}

	setCameraPos(x, y, force) {
		let newX = -x;
		const newY = -y;
		
		// Will I ever need this??
		/*if(!force && !$gameMap.canMoveCameraX()) {
			newX = this._cameraTargetX;
		}*/


		if(this._tilemap) {
			if(this._cameraTargetX !== newX || this._cameraTargetY !== newY) {
				this._cameraTargetX = newX;
				this._cameraTargetY = newY;
				if(force) {
					this._tilemap.x = this._cameraTargetX;
					this._tilemap.y = this._cameraTargetY;
				}
			}

			if(!force) {
				if(this._tilemap.x !== this._cameraTargetX) {
					this._tilemap.x = this.lerp(this._tilemap.x, this._cameraTargetX, PP.CameraSmoothing);
				}
				if(this._tilemap.y !== this._cameraTargetY) {
					this._tilemap.y = this.lerp(this._tilemap.y, this._cameraTargetY, PP.CameraSmoothing);
				}
			}

			if(Math.abs(this._tilemap.x - Math.round(this._tilemap.x)) < 0.1) {
				this._tilemap.x = Math.round(this._tilemap.x);
			}
			if(Math.abs(this._tilemap.y - Math.round(this._tilemap.y)) < 0.1) {
				this._tilemap.y = Math.round(this._tilemap.y);
			}
		}
	}

	isCameraAtTarget(threshold) {
		return Math.abs(this._tilemap.x - this._cameraTargetX) < threshold && Math.abs(this._tilemap.y - this._cameraTargetY) < threshold;
	}
}

class SpriteManager {
	static entities = [];

	static addEntity(e) {
		this.entities.push(e);
	}
}