const MineableTypes = {
	0: {
		name: "RedWall",
		hideTiles: false,
		hitBox: [0.5, 0.5, 2, 1],
		hp: 12,
		res: 25,
		hpIcon: "Rock"
	},
	1: {
		name: "Tree",
		hideTiles: false,
		hitBox: [1, 1, 1, 1],
		hp: 10,
		res: 30,
		hpIcon: "Stick"
	},
	2: {
		name: "TreeTrunk",
		hideTiles: false,
		hitBox: [1, 1, 0, 1],
		hp: 6,
		res: 30,
		hpIcon: "Stick"
	},
	99: {
		name: "GodColumn",
		hideTiles: true,
		hitBox: [0.5, 0.5, 2, 1],
		hp: 50,
		res: 100,
		hpIcon: "MetalHeart"
	}
};
