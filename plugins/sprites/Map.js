

class Map extends Sprite {
	constructor(width, height) {
		const b = new Bitmap(width, height);
		b.smooth = true;
		super(b);

		this.anchor.set(0.5);

		this.flags = [];
		for(let i = 0; i < 3; i++) {
			const flag = new Sprite(ImageManager.loadPicture("FlagCursor"));
			flag.anchor.set(0.5, 1);
			this.addChild(flag);
			this.flags.push(flag);
			flag.visible = $gameVariables.value(30) === 1;
		}

		this.mapStore = new Sprite(ImageManager.loadPicture("MapStore"));
		this.mapStore.anchor.set(0.5, 1);
		this.addChild(this.mapStore);

		this.foodStore = new Sprite(ImageManager.loadPicture("FoodStore"));
		this.foodStore.anchor.set(0.5, 1);
		this.addChild(this.foodStore);

		this.orbCave = new Sprite(ImageManager.loadPicture("OrbCave"));
		this.orbCave.anchor.set(0.5, 1);
		this.addChild(this.orbCave);

		this.cursor = new Sprite(ImageManager.loadPicture("PlayerCursor"));
		this.cursor.anchor.set(0.5, 1);
		this.addChild(this.cursor);

		this.refreshStaticPos();

		this._displayRatio = 0;

		SpriteManager.addUi(this);

		this.generate();
	}

	onOpen() {
		this.children.sort((a, b) => {
			if (a.z !== b.z) {
				return a.z - b.z;
			} else if (a.y !== b.y) {
				return a.y - b.y;
			} else if (a.x !== b.x) {
				return a.x - b.x;
			} else {
				return a.spriteId - b.spriteId;
			}
		});
	}

	setScale(s) {
		this.scale.set(s);
		this.cursor.scale.set(s === 0 ? 0 : (1 / s));
	}

	setupCorner() {
		this.move(720, 66);
		this.tint = 0xeeeeee;
		this.setScale(0.3);
	}

	update() {
		this.updatePlayerPosCursor();
		this.updatePauseInflate();
		this.refreshStaticPos();
	}

	updatePlayerPosCursor() {
		const globalWidth = GenerationManager.GLOBAL_WIDTH * 32;
		const globalHeight = GenerationManager.GLOBAL_HEIGHT * 32;
		const px = ($ppPlayer.position.x + (globalWidth / 2)) / (globalWidth);
		const py = ($ppPlayer.position.y + (globalHeight / 2)) / (globalHeight);
		this.cursor.move((px * (this.width)) - (this.width / 2), (py * (this.height)) - (this.height / 2));
		//this.mapStore
	}

	refreshStaticPos() {
		if(this._isReady) return;

		this._isReady = true;

		const makePos = (x, y) => {
			const rx = (x + (GenerationManager.OFFSET_X * GenerationManager.TILES_X)) / GenerationManager.GLOBAL_WIDTH;
			const ry = (y + (GenerationManager.OFFSET_Y * GenerationManager.TILES_Y)) / GenerationManager.GLOBAL_HEIGHT;
			return [(rx * (this.width)) - (this.width / 2), (ry * (this.height)) - (this.height / 2)];
		};

		const pos = [$generation.redTarget, $generation.greenTarget, $generation.blueTarget];
		for(let i = 0; i < 3; i++) {
			const f = this.flags[i];

			if(!pos[i]) {
				this._isReady = false;
				continue;
			}

			const pxy = makePos(pos[i][0], pos[i][1]);
			f.move(pxy[0], pxy[1]);
		}

		const opxy = makePos(0, 0);
		this.orbCave.move(opxy[0], opxy[1]);

		if($generation.mapStorePos) {
			const mpxy = makePos($generation.mapStorePos[0], $generation.mapStorePos[1]);
			this.mapStore.move(mpxy[0], mpxy[1]);
		} else {
			this._isReady = false;
		}

		if($generation.foodStorePos) {
			const fpxy = makePos($generation.foodStorePos[0], $generation.foodStorePos[1]);
			this.foodStore.move(fpxy[0], fpxy[1]);
		} else {
			this._isReady = false;
		}
	}

	updatePauseInflate() {
		const isPaused = $gameMap.isMapPause();
		if(this._wasPaused !== isPaused) {
			this._wasPaused = isPaused;
			if(isPaused) {
				this.onOpen();
			}
		}
		const newRatio = this._displayRatio.moveTowardsCond(isPaused, 0, 1, 0.05);
		if(this._displayRatio !== newRatio) {
			this._displayRatio = newRatio;

			const r = isPaused ? newRatio.cubicOut() : newRatio.cubicIn();
			this.move(PP.lerp(720, (Graphics.width / 2), r), PP.lerpEx(66, (Graphics.height / 2), r));
			this.setScale(0.3 + (1.2 * r));
		}
	}

	generate() {
		const width = this.bitmap.width;
		const height = this.bitmap.height;

		this.bitmap.startFastFillRect();

		//const imgData = this.bitmap.getImageData();
		for(let x = 0; x < width; x++) {
			for(let y = 0; y < height; y++) {
				const xRatio = x / width;
				const yRatio = y / height;

				let col = 0x000000;
				let forceBlack = false;

				let alpha = 1;
				const dist = Math.sqrt(Math.pow(xRatio - 0.5, 2) + Math.pow(yRatio - 0.5, 2));
				if(dist > 0.48) {
					forceBlack = true;
					alpha = ((0.51 - dist) / 0.3).clamp(0, 1);
				}/* else if(dist > 0.47) {
					forceBlack = true;
					alpha = 1;
				}*/

				if(alpha <= 0) continue;

				if(!forceBlack) {

					const tile = $generation.getTileRatio(xRatio, yRatio) >>> 0;

					const block = ((tile & 0xff000000) >> 24);
					const topTile = ((tile & 0xff0000) >> 16);
					const midTile = ((tile & 0x00ff00) >> 8);

					if(block === 99) {
						col = 0x000000;
					/*} else if(block === 0) {
						col = 0x9c805d;
						this.bitmap.fillRect(x, y - 1, 1, 1, "#9c805d");
						alpha = 0.7;
					} */
					} else if(block === 1) {
						col = 0x57404e;
						if(block === 1 && this.bitmap.getPixelNumber(x, y - 1) !== 0) {
							this.bitmap.fastFillRect(x, y - 1, 1, 1, "rgba(111, 227, 163, " + alpha + ")");
						}
					} else if(block === 2) {
						col = 0x57404e;
					} else if(topTile === 220) {
						col = 0xffffff;
					} else if(midTile === 255) {
						const lowTile = (tile & 0x0000ff);
						if(lowTile === 200) {
							col = 0xe6cc8a;
						} else if(lowTile === 201) {
							col = 0x99c2db;
						} else if(lowTile === 203) {
							col = 0xd877a6;
						} else if(Math.floor(lowTile / 13) === 0) {
							col = 0x78b392;
						}
					} else {
						const midAuto = Math.floor(midTile / 13);
						//console.log("MID AUTO: " , midAuto);
						if(midAuto === 0) col = 0x78b392;
						else if(midAuto === 1) col = 0x4c8f82;
						else if(midAuto === 2) col = 0x372840;
					}

				} else {

					col = 0x000000;

				}

				const colStr = "rgba(" + ((col & 0xff0000) >> 16) + ", " + ((col & 0x00ff00) >> 8) + ", " + (col & 0x0000ff) + ", " + alpha + ")";

				/*
				imgData[setIndex + 0] = ((col & 0xff0000) >> 16) & 255;
				imgData[setIndex + 1] = ((col & 0x00ff00) >> 8) & 255;
				imgData[setIndex + 2] = (col & 0x0000ff) & 255;
				imgData[setIndex + 3] = 255;
				*/

				if(this.bitmap.getAlphaPixel(x, y) <= 0) {
					this.bitmap.fastFillRect(x, y, 1, 1, colStr);
				}
			}
		}

		this.bitmap.endFastFillRect();

		//this.bitmap.setImageData(imgData);
	}
}
