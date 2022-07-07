const TileTypes = {
	0: {
		name: "Grass"
	},
	200: {
		name: "Sand", renderBelow: false
	},
	201: {
		name: "Water", renderBelow: false
	},
	210: {
		name: "Flowers1", renderBelow: false
	},
	211: {
		name: "Flowers2",
		renderBelow: false
	},
	212: {
		name: "Flowers3",
		renderBelow: false
	},
	213: {
		name: "Flowers4",
		renderBelow: false
	},
	214: {
		name: ["GrassDecor1", "GrassDecor2", "GrassDecor3", "GrassDecor4"],
		renderBelow: false
	},
	215: {
		name: ["GrassRocks1", "GrassRocks2", "GrassRocks3", "GrassRocks4"],
		renderBelow: false
	},
	216: {
		name: "GrassBigRock",
		renderBelow: true
	},
	217: {
		name: ["SandDecor1", "SandDecor2", "SandDecor3"],
		renderBelow: false
	},
	218: {
		name: ["SandRocks1", "SandRocks2", "SandRocks3", "SandRocks4"],
		renderBelow: false
	},
	219: {
		name: ["SandSeaShell1", "SandSeaShell2", "SandSeaShell3"],
		renderBelow: false
	},
	220: {
		name: "Path",
		renderBelow: true
	}
};
