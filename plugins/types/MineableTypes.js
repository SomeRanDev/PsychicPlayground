const MineableTypes = {
	0: {
		name: "SandPillar",
		hitBox: [0.5, 0.5, 2, 1],
		hp: 12,
		res: 25,
		hpIcon: "Rock",
		material: 1,
		materialGainMin: 8,
		materialGainMax: 12
	},
	1: {
		name: "Tree",
		hitBox: [1, 1, 1, 1],
		hp: 10,
		res: 30,
		hpIcon: "Stick",
		material: 3,
		materialGainMin: 18,
		materialGainMax: 24
	},
	2: {
		name: "TreeTrunk",
		hitBox: [1, 1, 0, 1],
		hp: 6,
		res: 30,
		hpIcon: "Stick",
		material: 3,
		materialGainMin: 8,
		materialGainMax: 12
	},
	99: {
		name: "GodColumn",
		hitBox: [0.5, 0.5, 1, 1],
		hp: 50,
		res: 100,
		hpIcon: "MetalHeart",
		material: 7,
		materialGainMin: 20,
		materialGainMax: 20
	}
};
