

modify_Spriteset_Map = class {
	initialize() {
		this._cameraTargetX = 0;
		this._cameraTargetY = 0;

		this._sortTimer = 0;

		PP.Spriteset_Map.initialize.apply(this, arguments);
	}

	createPPLayer() {
		this._ppLayer = new Sprite();
		this._tilemap.addChild(this._ppLayer);
		SpriteManager.ppLayer = this._ppLayer;
	}

	createPPEntities() {
		this._ppEntities = [];
		for(let i = 0; i < SpriteManager.entities.length; i++) {
			const e = SpriteManager.entities[i];
			this.createPPEntity(e);
		}
		SpriteManager.entities = [];
	}

	createPPEntity(e) {
		const spr = e.makeSprite();
		spr.z = 0;
		this._ppEntities.push(spr);
		this._ppLayer.addChild(spr);
	}

	_sortPPChildren() {
		if((this._sortTimer++) > 30) {
			this._sortTimer = 0;
			this._forceSortPPChildren();
		}
	}

	_forceSortPPChildren() {
		this._ppLayer.children.sort(this._comparePPChildOrder.bind(this));
	}

	_comparePPChildOrder(a, b) {
		if (a.z !== b.z) {
			return a.z - b.z;
		} else if (a.y !== b.y) {
			return a.y - b.y;
		} else {
			return a.spriteId - b.spriteId;
		}
	}

	createCharacters() {
		PP.Spriteset_Map.createCharacters.apply(this, arguments);
		this.clearChildrenSprites();
		this.createPPLayer();
		this.createChunksLayer();
		this.createPPEntities();
		this.createMapCursor();
		this.createHUDContainer();
		this.createUIContainer();
	}

	clearChildrenSprites() {
		for(const sprite of this._characterSprites) {
			this._tilemap.removeChild(sprite);
		}
		this._characterSprites = [];
	}

	createChunksLayer() {
		this._chunkLayer = new Sprite();
		this._chunkLayer.z = -100;
		this._ppLayer.addChild(this._chunkLayer);
	}

	createMapCursor() {
		this._mapCursor = new MouseCursor();
		this._mapCursor.z = -10;
		this._ppLayer.addChild(this._mapCursor);
	}

	createHUDContainer() {
		this._hudContainer = new Sprite();
		this._hudContainer.z = 9999;
		this._ppLayer.addChild(this._hudContainer);
		SpriteManager.hudContainer = this._hudContainer;
		SpriteManager.processHudCache();
	}

	createUIContainer() {
		this._uiContainer = new Sprite();
		this.addChild(this._uiContainer);
		SpriteManager.uiContainer = this._uiContainer;
		SpriteManager.processUiCache();
	}

	update() {
		PP.Spriteset_Map.update.apply(this, arguments);
		this._sortPPChildren();
	}

	destroy(options) {
		PP.Spriteset_Map.destroy.apply(this, arguments);
		SpriteManager.ppLayer = null;
		SpriteManager.uiContainer = null;
	};

	//==============================
	// Camera stuff
	//==============================
	canMoveCamera() {
		return true;
	}

	setCameraPos(x, y, force) {
		if(this._tilemap) {
			this.updateCameraPosition(-x, -y, force);
			if(!force) {
				this.moveCameraTowardsTarget();
			}
			this.roundCameraPosition();
		}
	}

	updateCameraPosition(x, y, force) {
		if(this._cameraTargetX !== x || this._cameraTargetY !== y) {
			this._cameraTargetX = x;
			this._cameraTargetY = y;
			if(force) {
				this._tilemap.x = this._cameraTargetX;
				this._tilemap.y = this._cameraTargetY;
			}
		}
	}

	moveCameraTowardsTarget() {
		if(this._tilemap.x !== this._cameraTargetX) {
			this._tilemap.x = PP.lerp(this._tilemap.x, this._cameraTargetX, PP.CameraSmoothing);
		}
		if(this._tilemap.y !== this._cameraTargetY) {
			this._tilemap.y = PP.lerp(this._tilemap.y, this._cameraTargetY, PP.CameraSmoothing);
		}
	}

	roundCameraPosition() {
		if(Math.abs(this._tilemap.x - Math.round(this._tilemap.x)) < 0.1) {
			this._tilemap.x = Math.round(this._tilemap.x);
		}
		if(Math.abs(this._tilemap.y - Math.round(this._tilemap.y)) < 0.1) {
			this._tilemap.y = Math.round(this._tilemap.y);
		}
	}

	isCameraAtTarget(threshold) {
		return Math.abs(this._tilemap.x - this._cameraTargetX) < threshold && Math.abs(this._tilemap.y - this._cameraTargetY) < threshold;
	}
}

class SpriteManager {
	static entities = [];
	static uiCache = [];
	static hudCache = [];

	static uiContainer = null;
	static hudContainer = null;

	static sort() {
		SceneManager._scene._spriteset._forceSortPPChildren();
	}

	static addUi(ui) {
		if(!this.uiContainer) {
			this.uiCache.push(ui);
		} else {
			this.uiContainer.addChild(ui);
		}
	}

	static processUiCache() {
		for(const ui of this.uiCache) {
			this.uiContainer.addChild(ui);
		}
		this.uiCache = [];
	}

	static addHud(hud) {
		if(!this.hudContainer) {
			this.hudCache.push(hud);
		} else {
			this.hudContainer.addChild(hud);
		}
	}

	static processHudCache() {
		for(const hud of this.hudCache) {
			this.hudContainer.addChild(hud);
		}
		this.hudCache = [];
	}

	static addEntity(e) {
		if(SceneManager._scene?._spriteset?._ppEntities) {
			SceneManager._scene._spriteset.createPPEntity(e);
		} else {
			this.entities.push(e);
		}
	}

	static addChunk(c) {
		if(SceneManager._scene?._spriteset?._chunkLayer) {
			const layer = SceneManager._scene._spriteset._chunkLayer;
			layer.addChild(c);
		}
	}

	static removeChunk(c) {
		if(SceneManager._scene?._spriteset?._chunkLayer) {
			const layer = SceneManager._scene._spriteset._chunkLayer;
			layer.removeChild(c);
		}
	}
}