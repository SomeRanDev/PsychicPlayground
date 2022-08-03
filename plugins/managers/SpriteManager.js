

modify_Spriteset_Map = class {
	initialize() {
		this._cameraTargetX = 0;
		this._cameraTargetY = 0;

		this._sortTimer = 0;

		PP.Spriteset_Map.initialize.apply(this, arguments);
	}

	createMainLayer() {
		this._mainLayer = new Sprite();
		this._mainLayer.z = 1;
		this._tilemap.addChild(this._mainLayer);
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

	removePPEntity(eSpr) {
		this._ppEntities.remove(eSpr);
		this._ppLayer.removeChild(eSpr);
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
		} else if (a.x !== b.x) {
			return a.x - b.x;
		} else {
			return a.spriteId - b.spriteId;
		}
	}

	createCharacters() {
		PP.Spriteset_Map.createCharacters.apply(this, arguments);
		this.clearChildrenSprites();

		this.createMainLayer();

		this.createChunksLayer();
		this.belowEntities();
		this.createMapCursor();
		this.createMapCursorContainer();

		this.createPPLayer();
		this.createPPEntities();

		this.createPauseDarken();
		this.createDeathDarken();
		this.createHUDContainer();
		this.createUIContainer();
		this.createDeathTransition();
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
		this._mainLayer.addChild(this._chunkLayer);
	}

	belowEntities() {
		this._belowLayer = new Sprite();
		this._belowLayer.z = -80;
		this._mainLayer.addChild(this._belowLayer);
	}

	createPPLayer() {
		this._ppLayer = new Sprite();
		//this._ppLayer.z = 1;
		this._mainLayer.addChild(this._ppLayer);
		SpriteManager.ppLayer = this._ppLayer;
	}

	createMapCursor() {
		this._mapCursor = new MouseCursor();
		this._mapCursor.z = -10;
		this._mainLayer.addChild(this._mapCursor);
	}

	createMapCursorContainer() {
		this._mapCursorContainer = new Sprite();
		this._mapCursorContainer.z = -10;
		this._mainLayer.addChild(this._mapCursorContainer);
	}

	createPauseDarken() {
		this._pauseDarken = new Sprite(ImageManager.loadPicture("ScreenOverlay"));
		this._pauseDarken.z = 1000;
		this._pauseDarken.anchor.set(0.5);
		this._pauseDarken.alpha = 0;
		SpriteManager.darken = this._pauseDarken;
		this._mainLayer.addChild(this._pauseDarken);
	}

	createDeathDarken() {
		this._deathDarken = new Sprite(ImageManager.loadPicture("ScreenOverlay"));
		this._deathDarken.z = -5;
		this._deathDarken.anchor.set(0.5);
		this._deathDarken.alpha = 0;
		this._deathDarken.visible = false;
		SpriteManager.deathDarken = this._deathDarken;
		this._mainLayer.addChild(this._deathDarken);
	}

	createHUDContainer() {
		this._hudContainer = new Sprite();
		this._hudContainer.z = 9999;
		this._mainLayer.addChild(this._hudContainer);
		SpriteManager.hudContainer = this._hudContainer;
		SpriteManager.processHudCache();
	}

	createUIContainer() {
		this._uiContainer = new Sprite();
		this.addChild(this._uiContainer);
		SpriteManager.uiContainer = this._uiContainer;
		SpriteManager.processUiCache();
	}

	createDeathTransition() {
		this._deathTransition = new Sprite(ImageManager.lUi("BlackCircle"));
		this._deathTransition.anchor.set(0.5);
		this._deathTransition.move(Graphics.width / 2, Graphics.height / 2);
		this._deathTransition.scale.set(0);
		this._deathTransition.visible = false;
		SpriteManager.deathTransition = this._deathTransition;
		this.addChild(this._deathTransition);
	}

	update() {
		PP.Spriteset_Map.update.apply(this, arguments);
		this._sortPPChildren();
	}

	updateUiOnly() {
		this._hudContainer.update();
		this._uiContainer.update();
	}

	destroy(options) {
		PP.Spriteset_Map.destroy.apply(this, arguments);
	}

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
	static deathDarken = null
	static deathTransition = null;

	static clear() {
		this.entities = [];
		this.uiCache = [];
		this.hudCache = [];

		this.uiContainer = null;
		this.hudContainer = null;
		this.deathDarken = null
		this.deathTransition = null;
	}

	static onPause() {
		if(SceneManager._scene?._spriteset?._mapCursor) {
			SceneManager._scene._spriteset._mapCursor.visible = false;
		}
	}

	static onUnpause() {
		if(SceneManager._scene?._spriteset?._mapCursor) {
			SceneManager._scene._spriteset._mapCursor.visible = true;
		}
	}

	static sort() {
		SceneManager._scene._spriteset._forceSortPPChildren();
	}

	static validate() {
		const ppLayer = SceneManager._scene._spriteset._ppLayer;
		let minY = -99999999999;
		const len = ppLayer.children.length;
		let result = true;
		for(let i = 0; i < len; i++) {
			const c = ppLayer.children[i];
			if(c.z !== 0) continue;
			if(c.y >= minY) {
				minY = c.y;
			} else {
				let success = false;
				ppLayer.removeChild(c)
				i--;
				for(let j = i; j >= 0; j--) {
					const cc = ppLayer.children[j];
					if(cc.y <= c.y) {
						ppLayer.addChildAt(c, j);
						success = true;
						break;
					}
				}
				if(!success) {
					ppLayer.addChildAt(c, 0);
				}
				result = false;
			}
		}
		return result;
	}

	static belowLayer() {
		return SceneManager._scene._spriteset._belowLayer;
	}

	static addUi(ui) {
		if(!this.uiContainer) {
			this.uiCache.push(ui);
		} else {
			this.uiContainer.addChild(ui);
		}
	}

	static removeUi(ui) {
		if(!this.uiContainer) {
			this.uiCache.remove(ui);
		} else {
			this.uiContainer.removeChild(ui);
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

	static removeEntity(e) {
		if(SceneManager._scene?._spriteset?._ppEntities) {
			SceneManager._scene._spriteset.removePPEntity(e.sprite);
		} else {
			this.entities.remove(e);
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

	static globalToWorld(pos) {
		if(SceneManager._scene._spriteset._tilemap) {
			return SceneManager._scene._spriteset._tilemap.worldTransform.applyInverse(pos);
		}
		return new Point(0, 0);
	}
}

Object.defineProperty(Tilemap.prototype, "width", {
    get: function() {
        return this._mapWidth * 32;
    },
    set: function(value) {
        this._width = value;
    },
    configurable: true
});

Object.defineProperty(Tilemap.prototype, "height", {
    get: function() {
        return this._mapHeight * 32;
    },
    set: function(value) {
        this._height = value;
    },
    configurable: true
});

Tilemap.prototype.updateTransform = function() {
    const ox = Math.ceil(this.origin.x);
    const oy = Math.ceil(this.origin.y);
    const startX = 0;//Math.floor((ox - this._margin) / this._tileWidth);
    const startY = 0;//Math.floor((oy - this._margin) / this._tileHeight);
    this._lowerLayer.x = 0;//startX * this._tileWidth - ox;
    this._lowerLayer.y = 0;//startY * this._tileHeight - oy;
    this._upperLayer.x = 0;//startX * this._tileWidth - ox;
    this._upperLayer.y = 0;// startY * this._tileHeight - oy;
    if (
        this._needsRepaint ||
        this._lastAnimationFrame !== this.animationFrame ||
        this._lastStartX !== startX ||
        this._lastStartY !== startY
    ) {
        this._lastAnimationFrame = this.animationFrame;
        this._lastStartX = startX;
        this._lastStartY = startY;
        this._addAllSpots(startX, startY);
        this._needsRepaint = false;
    }
    this._sortChildren();
    PIXI.Container.prototype.updateTransform.call(this);
};