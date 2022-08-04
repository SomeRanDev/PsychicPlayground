
function playSe(name, volume = 90, pitch = 100, pan = 0) {
	AudioManager.playSe({ name, volume, pitch, pan });
}

function playFreqSe(name, pitchStart = 80, pitchEnd = 120, volume = 90, pan = 0) {
	const pitch = pitchStart + Math.floor((pitchEnd - pitchStart) * Math.random());
	AudioManager.playSe({ name, volume, pitch, pan });
}
