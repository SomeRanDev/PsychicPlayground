AudioManager.createBuffer = function(folder, name) {
	const ext = (folder === "se/" ? ".wav" : this.audioFileExt());
	const url = this._path + folder + Utils.encodeURI(name) + ext;
	const buffer = new WebAudio(url);
	buffer.name = name;
	buffer.frameCount = Graphics.frameCount;
	return buffer;
};