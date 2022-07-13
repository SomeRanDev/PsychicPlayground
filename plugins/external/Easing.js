const Easing = require("./js/plugins/external/easing-functions.js");

Number.prototype.cubicOut = function() {
	return Easing.Cubic.Out(this);
};

Number.prototype.cubicIn = function() {
	return Easing.Cubic.In(this);
};

Number.prototype.quadOut = function() {
	return Easing.Quadratic.Out(this);
};

Number.prototype.quadIn = function() {
	return Easing.Quadratic.In(this);
};

Number.prototype.backOut = function() {
	return Easing.Back.Out(this);
};

Number.prototype.moveUnderTowards = function(target, amount) {
	if((this + amount) < target) return this + amount;
	else return target;
};

Number.prototype.moveOverTowards = function(target, amount) {
	if((this - amount) > target) return this - amount;
	else return target;
};

Number.prototype.moveTowardsCond = function(cond, lower, upper, amount) {
	if(cond) {
		return this.moveUnderTowards(upper, amount);
	} else {
		return this.moveOverTowards(lower, amount);
	}
};
