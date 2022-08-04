const TileTypes = {
	0: {
		name: "Grass"
	},
	1: {
		name: "DarkGrass"
	},
	2: {
		name: "EvilGrass"
	},
	5: {
		name: "Carpet",
		renderBelow: true
	},
	200: {
		name: "Sand", renderBelow: false
	},
	201: {
		name: "Water",
		renderBelow: false,
		isAnimated: true,
		cantWalk: true
	},
	202: {
		name: "AloneGrass", renderBelow: false
	},
	203: {
		name: "Lava",
		renderBelow: false,
		isAnimated: true,
		cantWalk: true
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
	},
	221: {
		name: ["Carpet1", "Carpet2"],
		renderBelow: false
	},
	222: {
		name: ["WoodTile1", "WoodTile2"],
		renderBelow: false
	},
	223: {
		name: ["HWoodTile1", "HWoodTile2"],
		renderBelow: false
	},
	224: {
		name: ["AltCarpet1", "AltCarpet2"],
		renderBelow: false
	},
	225: {
		name: ["EvilGrassDecor1", "EvilGrassDecor2", "EvilGrassDecor3", "EvilGrassDecor4"],
		renderBelow: false
	},
	226: {
		name: ["EvilGrassRocks1", "EvilGrassRocks2", "EvilGrassRocks3", "EvilGrassRocks4"],
		renderBelow: false
	},
};
