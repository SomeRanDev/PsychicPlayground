

class Map extends Sprite {
	constructor(width, height) {
		const b = new Bitmap(width, height);
		b.smooth = true;
		super(b);
	}

	generate() {
		const width = this.bitmap.width;
		const height = this.bitmap.height;
		//const imgData = this.bitmap.getImageData();
		for(let x = 0; x < width; x++) {
			for(let y = 0; y < height; y++) {
				const xRatio = x / width;
				const yRatio = y / height;
				//const setIndex = (y * (width * 4)) + (x * 4);

				const tile = GenerationManager.getTileRatio(xRatio, yRatio);

				let col = "#ffffff";
				let alpha = 1;

				const block = ((tile & 0xff000000) >> 24);
				const topTile = ((tile & 0xff0000) >> 16);
				const midTile = ((tile & 0x00ff00) >> 8);

				// if mid tile is empty...
				if(block === 99) {
					col = 0x000000;
				} else if(topTile === 220) {
					col = 0xffffff;
				} else if(midTile === 255) {
					const lowTile = (tile & 0x0000ff);
					if(lowTile === 200) {
						col = 0xfdcbb0;
					}
				} else if(Math.floor(midTile / 13) === 0) {
					col = 0xa884f3;
				}

				const dist = Math.sqrt(Math.pow(xRatio - 0.5, 2) + Math.pow(yRatio - 0.5, 2));
				if(dist > 0.49) {
					//alpha = (1 - (dist - 0.45 / 0.3));
					//console.log(dist);
					alpha = 0;//(0.8 - (dist - 0.5) * 5).clamp(0, 1);
				} else if(dist > 0.48) {
					col = 0x000000;
					alpha = 1;
				}

				const colStr = "rgba(" + ((col & 0xff0000) >> 16) + ", " + ((col & 0x00ff00) >> 8) + ", " + (col & 0x0000ff) + ", " + alpha + ")";

				/*
				imgData[setIndex + 0] = ((col & 0xff0000) >> 16) & 255;
				imgData[setIndex + 1] = ((col & 0x00ff00) >> 8) & 255;
				imgData[setIndex + 2] = (col & 0x0000ff) & 255;
				imgData[setIndex + 3] = 255;
				*/

				this.bitmap.fillRect(x, y, 1, 1, colStr)
			}
		}

		//this.bitmap.setImageData(imgData);
	}
}
