const Easing = require("./js/plugins/external/easing-functions.js");

Number.prototype.cubicOut = function() {
	return Easing.Cubic.Out(this);
}
