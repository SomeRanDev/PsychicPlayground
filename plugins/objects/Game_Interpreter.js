Game_Interpreter.prototype.updateWait = function() {
	if($gameTemp.forceWait) {
		return true;
	}
	return this.updateWaitCount() || this.updateWaitMode();
};