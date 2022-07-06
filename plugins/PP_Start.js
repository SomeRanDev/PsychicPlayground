const TS = 32;
const TS2 = 16;

var PP = {};

PP.WS = 1;
PP.Time = 0;

PP.GlobalKeys = Object.keys(globalThis).length;

PP.CameraSmoothing = 0.1;

PP.AddToHistory = function(func, className, name) {
	if(func) {
		if(PP[className][name]) {
			alert("Repeat override of: `" + className + "." + name + "`!!");
		}
		PP[className][name] = func;
	}
}

PP.MeltTogether = function(es6Class, name) {
	const className = name || (es6Class.MELTNAME || es6Class.prototype.constructor.name.replace(/_+$/, ""));
	const classObj = globalThis[className];
	if(classObj) {
		PP[className] = PP[className] || {};
		Object.getOwnPropertyNames(es6Class.prototype).forEach(function(name) {
			if(name === "constructor") return;
			PP.AddToHistory(classObj.prototype[name], className, name);
			classObj.prototype[name] = es6Class.prototype[name];
		});
		Object.getOwnPropertyNames(es6Class).forEach(function(name) {
			if(name === "length" || name === "prototype" || name === "name") return;
			PP.AddToHistory(classObj[name], className, name);
			classObj[name] = es6Class[name];
		});
	}
};

PP.ApplyModifies = function() {
	const Keys = Object.keys(globalThis);
	const NewLength = Keys.length;
	for(let i = PP.GlobalKeys; i < NewLength; i++) {
		const name = Keys[i];
		if(name.startsWith("modify_")) {
			PP.MeltTogether(globalThis[name], name.replace(/^modify_([a-zA-Z_]+)(?:_\d+)?$/, "$1"));
		}
	}
};

PP.lerp = function(a, b, x) {
	if(Math.abs(a - b) < 0.1) return b;
	return a + (b - a) * x;
};

PP.lerpEx = function(a, b, x) {
	return a + (b - a) * x;
};

PP.makeText = function(text, fontSize = 20, align = "center") {
	const Text = new PIXI.Text(text, {
		fontFamily: $gameSystem.mainFontFace(),
		fontSize: fontSize,
		fill: 0xffffff,
		align: align,
		stroke: "rgba(0, 0, 0, 0.75)",
		strokeThickness: 4,
		lineJoin: "round"
	});
	Text.anchor.set(0.5, 1);
	Text.resolution = 2;
	return Text;
};

PP.rotateBitmap = function(bitmap, rotation) {
	let renderer = PIXI.autoDetectRenderer();
	let renderTexture = PIXI.RenderTexture.create({ width: bitmap.width, height: bitmap.height });
	let sprite = new Sprite(bitmap);

	sprite.position.x = bitmap.width / 2;
	sprite.position.y = bitmap.height / 2;
	sprite.anchor.x = 0.5;
	sprite.anchor.y = 0.5;

	sprite.rotation = rotation;

	renderer.render(sprite, renderTexture);

	const result = new Bitmap(bitmap.width, bitmap.height);
	result.fillAll("#ffffff");
	const canvas = renderer.extract.canvas(renderTexture);

	result.context.drawImage(canvas, 0, 0);
	result.baseTexture.update();

	canvas.width = 0;
	canvas.height = 0;
	renderTexture.destroy({ destroyBase: true });

	return result;
};

PP.Int32ArrayOf = function() {
	const result = new Int32Array(arguments.length);
	for(let i = 0; i < arguments.length; i++) {
		result[i] = arguments[i];
	}
	return result;
};
