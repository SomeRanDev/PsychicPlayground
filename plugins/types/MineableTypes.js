const MineableTypes = {
	0: {
		name: "SandPillar",
		hitBox: [0.5, 0.5, 2, 1],
		hp: 12,
		hpIcon: "Sand",
		material: 1,
		materialGainMin: 8,
		materialGainMax: 12,
		mineSound: ["MineSand", 10]
	},
	1: {
		name: "Tree",
		hitBox: [1, 1, 1, 1],
		hp: 10,
		hpIcon: "Stick",
		material: 3,
		materialGainMin: 18,
		materialGainMax: 24,
		mineSound: ["MineTree", 10]
	},
	2: {
		name: "TreeTrunk",
		hitBox: [1, 1, 0, 1],
		hp: 6,
		hpIcon: "Stick",
		material: 3,
		materialGainMin: 8,
		materialGainMax: 12,
		mineSound: ["MineTree", 10]
	},
	3: {
		name: "SmallTree",
		hitBox: [0.5, 0.5, 1, 1],
		hp: 6,
		hpIcon: "Stick",
		material: 3,
		materialGainMin: 8,
		materialGainMax: 12,
		mineSound: ["MineTree", 10]
	},
	4: {
		name: "Bush",
		hitBox: [0.5, 0.5, 0, 1],
		hp: 3,
		hpIcon: "Stick",
		material: 3,
		materialGainMin: 3,
		materialGainMax: 5,
		mineSound: ["MineTree", 10]
	},
	5: {
		name: "Rock",
		hitBox: [0.5, 0.5, 0, 1],
		hp: 3,
		hpIcon: "Rock",
		material: 2,
		materialGainMin: 3,
		materialGainMax: 5,
		mineSound: ["MineRock", 80]
	},
	6: {
		name: "RockPillar",
		hitBox: [0.5, 0.5, 2, 1],
		hp: 18,
		hpIcon: "Rock",
		material: 2,
		materialGainMin: 8,
		materialGainMax: 12,
		mineSound: ["MineRock", 80]
	},
	7: {
		name: "TropicalTree",
		hitBox: [1, 1, 1, 1],
		hp: 12,
		hpIcon: "Stick",
		material: 3,
		materialGainMin: 20,
		materialGainMax: 26,
		mineSound: ["MineTree", 10]
	},
	99: {
		name: "GodColumn",
		hitBox: [0.5, 0.5, 1, 1],
		hp: 30,
		skillRequire: 2,
		hpIcon: "MetalHeart",
		material: 7,
		materialGainMin: 20,
		materialGainMax: 20,
		mineSound: ["MineRock", 80]
	}
};
