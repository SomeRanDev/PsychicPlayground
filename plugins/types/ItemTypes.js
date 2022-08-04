const ItemTypes = {
	0: {
		name: "Map",
		max: 1,
		icon: "Map",
		desc: "View the world.\n(Press M)",
		isFood: false,
		allowChestFind: false,
		behavior: function() {
			$gameTemp.reserveCommonEvent(11);
			return true;
		}
	},
	1: {
		name: "Leftovers",
		max: 1,
		icon: "Leftovers",
		desc: "Edible... stuff?\n(+? hp/+? hunger)",
		isFood: true,
		allowChestFind: true,
		behavior: function() {
			let hp = -20 + (Math.floor(Math.random() * 4) * 10);
			let hunger = (Math.floor(Math.random() * 3) * 10);
			if(hp === 0) hp = 10;
			$ppPlayer.addHpFromItem(hp);
			$ppPlayer.addHungerFromItem(hunger);
			$ppPlayer.playHpAbilitySe();
		}
	},
	2: {
		name: "Crunchy Pizza",
		max: 1,
		icon: "CrunchyPizza",
		desc: "Tasty(?) snack.\n(+4 hp)",
		isFood: true,
		allowChestFind: true,
		behavior: function() {
			$ppPlayer.addHpFromItem(40);
			$ppPlayer.playHpAbilitySe();
		}
	},
	3: {
		name: "Vegan Pizza",
		max: 1,
		icon: "VeganPizza",
		desc: "Healthy snack.\n(+6 hp/+3 hunger)",
		isFood: true,
		allowChestFind: true,
		behavior: function() {
			$ppPlayer.addHpFromItem(60);
			$ppPlayer.playHpAbilitySe();
		}
	}
};
