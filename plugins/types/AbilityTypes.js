
function GetTouchDir() {
	return Math.atan2(TouchInput.worldY - $ppPlayer.position.y, TouchInput.worldX - $ppPlayer.position.x);
}

function GetTouchDist() {
	return Math.sqrt(Math.pow(TouchInput.worldY - $ppPlayer.position.y, 2) + Math.pow(TouchInput.worldX - $ppPlayer.position.x, 2));
}

function MakeNewPoint(dist, dir) {
	return [$ppPlayer.position.x + (Math.cos(dir) * dist), $ppPlayer.position.y + (Math.sin(dir) * dist)];
}

const AbilityTypes = [
	{
		name: "Geokinesis",
		isActive: true,
		icon: "Geokinesis1",
		desc: "Mine and absorb\nmaterials.",
		cooldownSpeed: 1
	},
	{
		name: "Geokinesis II",
		isActive: true,
		icon: "Geokinesis2",
		desc: "Mine and absorb\nmaterials.",
		cooldownSpeed: 1
	},
	{
		name: "Geokinesis III",
		isActive: true,
		icon: "Geokinesis3",
		desc: "Break free\nfrom anything.",
		cooldownSpeed: 1
	},
	{
		name: "Pyrokinesis",
		isActive: true,
		icon: "Pyrokinesis",
		desc: "Emit flames.",
		cooldownSpeed: 0.3,
		behavior: function() {
			if($ppPlayer.inventory.addSkillCooldown(3, -3)) {
				$ppPlayer.makeAndShootProjectile({
					icon: "Pyrokinesis",
					setDamage: 0.1,
					lifetime: 30,
					targetX: TouchInput.worldX - 25 + Math.floor(Math.random() * 50),
					targetY: TouchInput.worldY - 25 + Math.floor(Math.random() * 50)
				});
			}
			return true;
		}
	},
	{
		name: "Cryokinesis",
		isActive: true,
		icon: "Cryokinesis",
		desc: "Throw ice.",
		cooldownSpeed: 2,
		requireNoCooldown: true,
		behavior: function() {
			$ppPlayer.makeAndShootProjectile({
				icon: "Cryokinesis",
				damage: 2,
				lifetime: 120,
				speed: 2,
				targetX: TouchInput.worldX,
				targetY: TouchInput.worldY
			});
		}
	},
	{
		// 5
		name: "Hydrokinesis",
		isActive: true,
		icon: "Hydrokinesis",
		desc: "Spray water.\nPushes enemies.",
		cooldownSpeed: 0.3,
		behavior: function() {
			if($ppPlayer.inventory.addSkillCooldown(5, -1)) {
				$ppPlayer.makeAndShootProjectile({
					icon: "Hydrokinesis",
					setDamage: 0,
					lifetime: 30,
					targetX: TouchInput.worldX - 25 + Math.floor(Math.random() * 50),
					targetY: TouchInput.worldY - 25 + Math.floor(Math.random() * 50)
				});
			}
			return true;
		}
	},
	{
		// 6
		name: "Botanokinesis",
		isActive: true,
		icon: "Botanokinesis",
		desc: "Slash using\nsharp grass.",
		cooldownSpeed: 0.5,
		requireNoCooldown: true,
		behavior: function() {
			const dir = GetTouchDir();
			const dist = GetTouchDist();

			for(let i = -1; i <= 1; i++) {
				const coords = MakeNewPoint(dist, dir + (Math.PI * ((300 - dist.clamp(0, 200)) / 300) * 0.3 * i));
				$ppPlayer.makeAndShootProjectile({
					icon: "Botanokinesis",
					damage: 2,
					lifetime: 120,
					speed: 5,
					targetX: coords[0],
					targetY: coords[1]
				});
			}
		}
	},
	{
		// 7
		name: "Audiokinesis",
		isActive: true,
		icon: "Audiokinesis",
		desc: "Release epic\nsound wave.",
		cooldownSpeed: 0.2,
		requireNoCooldown: true,
		behavior: function() {
			for(let i = -9; i <= 10; i++) {
				const coords = MakeNewPoint(10, (Math.PI * 0.1 * i));
				$ppPlayer.makeAndShootProjectile({
					icon: "Audiokinesis",
					damage: 5,
					lifetime: 120,
					speed: 7,
					targetX: coords[0],
					targetY: coords[1]
				});
			}
		}
	},
	{
		// 8
		name: "Combokinesis",
		isActive: true,
		icon: "Combokinesis",
		desc: "Unlease powerful\nfighting spirit.",
		cooldownSpeed: 0.2,
		behavior: function() {
			if($ppPlayer.inventory.addSkillCooldown(8, -1)) {
				if(Math.floor($ppPlayer.inventory.getSkillCooldown(8)) % 6 === 0) {
					$ppPlayer.makeAndShootProjectile({
						icon: "Combokinesis",
						setDamage: 0.4,
						lifetime: 40,
						targetX: TouchInput.worldX - 10 + Math.floor(Math.random() * 20),
						targetY: TouchInput.worldY - 10 + Math.floor(Math.random() * 20)
					});
				}
			}
			return true;
		}
	},
	{
		// 9
		name: "Electrokinesis",
		isActive: true,
		icon: "Electrokinesis",
		desc: "Emit shocking\nelectricity.",
		cooldownSpeed: 0.2,
		behavior: function() {
			if($ppPlayer.inventory.addSkillCooldown(9, -3.5)) {
				const coords = MakeNewPoint(10, Math.PI * 2 * (Math.round($ppPlayer.inventory.getSkillCooldown(9)) % 15) / 15);
				$ppPlayer.makeAndShootProjectile({
					icon: "Electrokinesis",
					setDamage: 1,
					lifetime: 40,
					targetX: coords[0],
					targetY: coords[1]
				});
			}
			return true;
		}
	},
	{
		// 10
		name: "Ferrikinesis",
		isActive: true,
		icon: "Ferrikinesis",
		desc: "Blast out\niron bars.",
		cooldownSpeed: 0.4,
		requireNoCooldown: true,
		behavior: function() {
			const dir = GetTouchDir();
			const dist = GetTouchDist();

			for(let i = -2; i <= 1; i++) {
				const coords = MakeNewPoint(dist, dir + (Math.PI * 0.5 * i));
				$ppPlayer.makeAndShootProjectile({
					icon: "Ferrikinesis",
					damage: 3,
					lifetime: 80,
					speed: 4,
					targetX: coords[0],
					targetY: coords[1]
				});
			}
		}
	},
	{
		// 11
		name: "Frigokinesis",
		isActive: true,
		icon: "Frigokinesis",
		desc: "Launch harmless\nsnowballs",
		cooldownSpeed: 9,
		requireNoCooldown: true,
		behavior: function() {
			$ppPlayer.makeAndShootProjectile({
				icon: "Frigokinesis",
				setDamage: 0,
				lifetime: 70,
				speed: 3.5,
				targetX: TouchInput.worldX,
				targetY: TouchInput.worldY
			});
		}
	},
	{
		// 12
		name: "Hemokinesis",
		isActive: true,
		icon: "Hemokinesis",
		desc: "Sacrifice health\nevery use.",
		cooldownSpeed: 1,
		requireNoCooldown: true,
		behavior: function() {
			if($ppPlayer.hp > 10) {
				const dir = GetTouchDir();

				$ppPlayer.takeDamage(10, 0, 0, 0);

				for(let i = -1; i <= 1; i++) {
					const coords = MakeNewPoint(20, dir + (Math.PI * 0.1 * i));
					$ppPlayer.makeAndShootProjectile({
						icon: "Hemokinesis",
						damage: 20,
						lifetime: 120,
						speed: 6,
						targetX: coords[0],
						targetY: coords[1]
					});
				}
			} else {
				return true;
			}
		}
	},
	{
		// 13
		name: "Toxikinesis",
		isActive: true,
		icon: "Toxikinesis",
		desc: "Sacrifice health\nduring use.",
		cooldownSpeed: 5,
		requireNoCooldown: true,
		behavior: function() {
			if($ppPlayer.hp > 10) {
				$ppPlayer.takeDamage(10, 0, 0, 0);

				for(let i = -4; i <= 5; i++) {
					const coords = MakeNewPoint(10, (Math.PI * 0.2 * i));
					$ppPlayer.makeAndShootProjectile({
						icon: "Toxikinesis",
						damage: 25,
						lifetime: 60,
						speed: 4,
						targetX: coords[0],
						targetY: coords[1]
					});
				}
			} else {
				return true;
			}
		}
	},
	{
		// 14
		name: "Typhokinesis",
		isActive: true,
		icon: "Typhokinesis",
		desc: "Release hot\nsmoke and steam.",
		cooldownSpeed: 0.1,
		behavior: function() {
			if($ppPlayer.inventory.addSkillCooldown(14, -2)) {
				const coords = MakeNewPoint(50, Math.PI * 2 * Math.random());
				$ppPlayer.makeAndShootProjectile({
					icon: "Typhokinesis",
					setDamage: 1,
					lifetime: 40,
					targetX: coords[0],
					targetY: coords[1]
				});
			}
			return true;
		}
	},
	{
		// 15
		name: "Chaoskinesis",
		isActive: true,
		icon: "Chaoskinesis",
		desc: "Random direction.\nRandom damage.",
		cooldownSpeed: 0.2,
		behavior: function() {
			if(TouchInput.isTriggered()) {
				$gameTemp._randomDir = Math.PI * 2 * Math.random();
				$gameTemp._randomDamage = (0.5 + Math.floor(Math.random() * 3 * 2) / 2);
			}
			if($ppPlayer.inventory.addSkillCooldown(15, -1)) {
				const coords = MakeNewPoint(10, $gameTemp._randomDir + (Math.PI * 0.1 * ((Graphics.frameCount % 4) - 2)));
				$ppPlayer.makeAndShootProjectile({
					icon: "Chaoskinesis",
					setDamage: $gameTemp._randomDamage,
					lifetime: 40,
					targetX: coords[0],
					targetY: coords[1]
				});
			}
			return true;
		}
	},
	{
		// 16
		// to be another combat skill
	},
	{
		// 17
		// to be another combat skill
	},
	{
		// 18
		// to be another combat skill
	},
	{
		// 19
		// to be another combat skill
	},
	{
		// 20
		name: "Mind Boost",
		isActive: true,
		icon: "MindBoost",
		desc: "Boost stats\ntemporarily.",
		cooldownSpeed: 0.1,
		requireNoCooldown: true,
		behavior: function() {
			$ppPlayer.addTelekineticBuff();
		}
	},
	{
		// 21
		name: "Speed Boost",
		isActive: true,
		icon: "SpeedBoost",
		desc: "Boost speed\ntemporarily.",
		cooldownSpeed: 0.1,
		requireNoCooldown: true,
		behavior: function() {
			$ppPlayer.addSpeedBuff();
		}
	},
	{
		// 22
		name: "Breaking Boost",
		isActive: true,
		icon: "BreakingBoost",
		desc: "Boost breaking\ntemporarily.",
		cooldownSpeed: 0.1,
		requireNoCooldown: true,
		behavior: function() {
			$ppPlayer.addBreakingBuff();
		}
	},
	{
		// 23
		name: "Heat Armor",
		isActive: true,
		icon: "HeatArmor",
		desc: "Temporarily reduce\ndamage by 50%.",
		cooldownSpeed: 0.1,
		requireNoCooldown: true,
		behavior: function() {
			$ppPlayer.addHeatArmor();
		}
	},
	{
		// 24
		name: "Fast Shield",
		isActive: true,
		icon: "FastShield",
		desc: "Invincible for\n2 seconds.",
		cooldownSpeed: 0.1,
		requireNoCooldown: true,
		behavior: function() {
			$ppPlayer.addFastShield();
		}
	},
	{
		// 25
		name: "Pairkinesis",
		isActive: true,
		icon: "Pairkinesis",
		desc: "Shoots extra\nmaterial w/ ON.",
		cooldownSpeed: 0.1,
		requireNoCooldown: false,
		isBool: true,
		getBool: function() {
			return $ppPlayer.getPairkinesis();
		},
		behavior: function() {
			if(!$ppPlayer._boolAbilityActive) {
				$ppPlayer._boolAbilityActive = true;
				$ppPlayer.togglePairkinesis();
				$ppPlayer.showPopupEx("Pairkinesis " + ($ppPlayer.getPairkinesis() ? "Activated" : "Deactivated"), 0xffffff);
				$ppPlayer.genericEffect([180, 180, 180, 180], function() {
					$ppPlayer._boolAbilityActive = false;
				});
			}
		}
	},
	{
		// 26
		// to be another combat skill
	},
	{
		// 27
		// to be another combat skill
	},
	{
		// 28
		// to be another combat skill
	},
	{
		// 29
		// to be another combat skill
	},
	{
		// 30
		name: "Vitakinesis",
		isActive: true,
		icon: "Vitakinesis",
		desc: "Heals 3 hearts.",
		cooldownSpeed: 0.1,
		requireNoCooldown: true,
		behavior: function() {
			if($ppPlayer.hp < $ppPlayer.maxHp) {
				$ppPlayer.addHpFromItem(30);
			} else {
				return true;
			}
		}
	},
];

//

// Turokinesis - make cheese
