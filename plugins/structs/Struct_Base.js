class Struct_Base {
	constructor(id) {
		this.id = id;
	}

	addToData(globalTileX, globalTileY) {
		this.clearArea(globalTileX, globalTileY);
		$generation.addStructToData(this, globalTileX, globalTileY);
	}

	clearArea(globalTileX, globalTileY) {
		//const globalTileXPos = globalTileX + (GenerationManager.OFFSET_X * GenerationManager.TILES_X);
		//const globalTileYPos = globalTileY + (GenerationManager.OFFSET_Y * GenerationManager.TILES_Y);

		const s = this.clearSize();
		const xStart = s[0];
		const yStart = s[1];
		const width = xStart + s[2];
		const height = yStart + s[3];
		for(let x = xStart; x < width; x++) {
			for(let y = yStart; y < height; y++) {
				$generation.clearTile(globalTileX + x, globalTileY + y);
			}
		}
	}

	spawn(chunk, localTileX, localTileY) {
		const width2 = (GenerationManager.GLOBAL_WIDTH / 2);
		const height2 = (GenerationManager.GLOBAL_HEIGHT / 2);
		const globalX = (chunk.chunkX * GenerationManager.TILES_X) + localTileX + width2;
		const globalY = (chunk.chunkY * GenerationManager.TILES_Y) + localTileY + height2;

		const s = this.size();
		const xStart = s[0];
		const yStart = s[1];
		const width = xStart + s[2];
		const height = yStart + s[3];
		for(let x = xStart; x < width; x++) {
			for(let y = yStart; y < height; y++) {
				CollisionManager.registerStructCollision(globalX + x, globalY + y);
			}
		}

		this.setupCustomCollisionResponses(globalX, globalY);

		return new StructEntity(chunk, localTileX, localTileY, this.imgPath(), this.backImgPath(), this.backOffset());
	}

	imgPath() {
		return "";
	}

	backImgPath() {
		return "";
	}

	backOffset() {
		return [0, 0];
	}

	size() {
		return [0, 0, 1, 1];
	}

	clearSize() {
		return this.size();
	}
}

class StructEntity {
	constructor(chunk, localTileX, localTileY, path, backPath, backOffset) {
		this.chunk = chunk;
		this.x = localTileX;
		this.y = localTileY;
		this.realX = chunk.baseSprite.x + (localTileX * 32);
		this.realY = chunk.baseSprite.y + (localTileY * 32);
		this.path = path;
		this.backPath = backPath;
		this.backOffset = backOffset;
		SpriteManager.addEntity(this);
	}

	makeSprite() {
		const spr = new Sprite();
		if(this.path) {
			spr.bitmap = ImageManager.lStruct(this.path);
		}
		spr.anchor.set(0.5, 1);
		spr.scale.set(2);
		spr.move(this.realX, this.realY + 16);

		return spr;
	}

	makeBackgroundSprite() {
		if(this.backPath) {
			const spr = new Sprite(ImageManager.lStruct(this.backPath));
			spr.anchor.set(0.5, 1);
			spr.scale.set(2);
			spr.move(this.realX, this.realY + 16);
			this.backgroundSprite = spr;
			return spr;
		}
		return null;
	}

	destroy() {
		SpriteManager.removeEntity(this);
		if(this.backgroundSprite) {
			this.backgroundSprite.parent.removeChild(this.backgroundSprite);
			this.backgroundSprite.destroy();
			this.backgroundSprite = null;
		}
	}
}
