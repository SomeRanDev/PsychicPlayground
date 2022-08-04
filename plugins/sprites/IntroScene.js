class IntroScene extends Sprite {
	constructor() {
		super();

		const s = SceneManager._scene;
		$gameTemp._introScene = this;
		s._spriteset.addChild(this);
		$gameTemp.updateEntities.push(this);

		s._isPaused = true;
		s._pauseType = 10;
		$gameMap.PauseMode = 10;

		this.dir = 0;
		this.time = 0;
		this.dist = 0;

		this.offsetX = 0;
		this.offsetY = 0;

		//s.removeChild(s.cursor);
		//s.addChild(s.cursor);

		this._background = new Sprite(ImageManager.loadPicture("TestBack"));
		this.addChild(this._background);

		this._container = new Sprite();
		this.addChild(this._container);

		this._slide = new Sprite();
		this._container.addChild(this._slide);

		this._oldSlide = new Sprite();
		this._container.addChild(this._oldSlide);

		this._glow = new PIXI.filters.AdvancedBloomFilter();

		this._container.filters = [
			new PIXI.filters.AsciiFilter(18),
			this._glow
		];

		this.animationOffset = 0;

		this._foreground = new Sprite(ImageManager.loadPicture("TestWhite"));
		this._foreground.alpha = 0;
		this.shouldFadeOut = false;
		this.fadeOutTime = 0;
		this.addChild(this._foreground);
	}

	removeSelf() {
		$gameTemp._introScene = null;
		this.parent.removeChild(this);
		$gameTemp.updateEntities.remove(this);

		const s = SceneManager._scene;
		s._isPaused = false;
		s._pauseType = -1;
		$gameMap.PauseMode = -1;
	}

	setSlide(path) {
		this.animationOffset = 1;

		if(this._slide.bitmap) {
			this._oldSlide.bitmap = this._slide.bitmap;
			this._oldSlide.move(this._slide.x, this._slide.y);
		}
		this._slide.bitmap = (ImageManager.loadPicture("slides/" + path));
		this._slide.x -= 800;

		this.offsetX = 0;
		this.offsetY = 0;
	}

	fadeOut() {
		this.shouldFadeOut = true;
	}

	update() {
		if(this.shouldFadeOut) {
			this.fadeOutTime++;
			this._foreground.alpha = this.fadeOutTime / 120;
		}

		this._glow.bloomScale = 1.5 + Math.sin(Graphics.frameCount * 0.05) * 0.5;

		if(this.animationOffset > 0) {
			this.animationOffset -= 0.01;
			if(this.animationOffset < 0) {
				this.animationOffset = 0;
			}
		}

		if(this._slide) {
			if(this.animationOffset === 0 && this.dist > 20) {
				this.dir += Math.PI;
				this.dist = 19.9;
			}

			const ao = this.animationOffset.cubicInOut() * 800;

			if(this.animationOffset === 0 && Math.random() < 0.05) {
				this.dir =  Math.PI * 2 * Math.random();
				this.offsetX = this._slide.x + ao;
				this.offsetY = this._slide.y;
				this.dist = 0;
			}
			this.dist += 0.06;
			this.time += 0.04;

			this._slide.x = (Math.cos(this.time) * this.dist) + this.offsetX - ao;
			this._slide.y = (Math.sin(this.time) * this.dist) + this.offsetY;

			this._oldSlide.x = this._slide.x + 800;
			this._oldSlide.y = this._slide.y;
		}
	}
}
