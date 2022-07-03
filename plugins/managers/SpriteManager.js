
Spriteset_Map.prototype.__old_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
Spriteset_Map.prototype.createLowerLayer = function() {
	this.createPPLayer();
    Spriteset_Map.prototype.__old_createLowerLayer.apply(this, arguments);
};

Spriteset_Map.prototype.createPPLayer = function() {
	this._ppLayer = new PIXI.Container();
	this.addChild(this._ppLayer);
};

Spriteset_Map.prototype.__old_createCharacters = Spriteset_Map.prototype.createCharacters;
Spriteset_Map.prototype.createCharacters = function() {
    Spriteset_Map.prototype.__old_createCharacters.apply(this, arguments);
    this._ppEntities = [];
    for(let i = 0; i < SpriteManager.entities.length; i++) {
    	const e = SpriteManager.entities[i];
    	const spr = e.makeSprite();
    	this._ppEntities.push(spr);
    	this.addChild(spr);
    }
};

class SpriteManager {
	static entities = [];

	static addEntity(e) {
		this.entities.push(e);
	}
}