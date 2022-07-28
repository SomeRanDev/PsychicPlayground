const CheckRewards = {
	EXP: 0,
	Skill: 1,
	Material: 2,
	Item: 3,
	Upgrade: 4,
	Random: 5,
	None: 6
};

class Chest extends Interactable {
	constructor(x, y, globalId = "", rewardType = CheckRewards.None, rewardId = -1, rewardQuantity = 1) {
		if(!globalId) {
			globalId = "Chest_" + $gameMap.mapId() + "_" + x + "_" + y;
		}

		const opened = $keyVars.on(globalId);

		super(x, y, {
			_realX: x,
			_realY: y
		}, opened ? "ChestOpen" : "Chest", 1, 1, 10);

		this.globalId = globalId;
		if(opened) {
			this.active = false;
		}

		this._isChestOpening = false;
		this._chestAni = 0;
		this._iconAni = 0;

		this.rewardType = rewardType;
		this.rewardId = rewardId;
		this.rewardQuantity = rewardQuantity;

		this._chestOpenBitmap = ImageManager.lEntities("ChestOpen");
	}

	update() {
		if(!this.active) {
			this.updateAnimation();
		}
		super.update();
		if(this.active) {
			this.updateChestOpen();
		}
	}

	openChest() {
		this._isChestOpening = true;
		$gameTemp.forceWait = true;
	}

	openChestEnd() {
		this._isChestOpening = false;
		$gameTemp.forceWait = false;

		this.sprite.scale.set(2);

		this.sprite.bitmap = this._chestOpenBitmap;
	}

	showRewardIcon() {
		this._isIconShowing = true;
		$gameTemp.forceWait = true;

		const rewardIcon = this.rewardIcon();
		this.iconSprite = new Sprite(rewardIcon);
		this.iconSprite.anchor.set(0.5);
		this.iconSprite.scale.set(2);
		this.iconSprite.alpha = 0;
		this.sprite.addChild(this.iconSprite);
	}

	showIconEnd() {
		this._isIconShowing = false;
		$gameTemp.forceWait = false;

		$gameVariables.setValue(10, this.rewardText());
		$keyVars.setOn(this.globalId);

		//this.addReward();
	}

	hideRewardIcon() {
		this._isIconHiding = true;
		$gameTemp.forceWait = true;
		this._iconAni = 0;
	}

	hideIconEnd() {
		this._isIconHiding = false;
		$gameTemp.forceWait = false;
		this.active = false;
	}

	resolveRandom() {
		if(this.rewardType === CheckRewards.Random) {
			this.rewardType = Math.floor(Math.random() * 5);

			switch(this.rewardType) {
				case CheckRewards.EXP: {
					this.rewardQuantity = 20 + Math.floor(Math.random() * 100);
					break;
				}
				case CheckRewards.Skill: {
					this.rewardId = $ppPlayer.inventory.getRandomNewSkill();
					this.rewardQuantity = 1;
					if(this.rewardId === -1) {
						this.rewardType = CheckRewards.None;
					}
					break;
				}
				case CheckRewards.Material: {
					this.rewardId = Math.floor(Math.random() * 4);
					this.rewardQuantity = 10 + Math.floor(Math.random() * 50);
					break;
				}
				case CheckRewards.Item: {
					this.rewardId = $ppPlayer.inventory.getRandomItem();
					this.rewardQuantity = 1;
					if(this.rewardId === -1) {
						this.rewardType = CheckRewards.None;
					}
					break;
				}
				case CheckRewards.Upgrade: {
					this.rewardQuantity = 1;
					this.rewardType = CheckRewards.None;
					break;
				}
			}
		}
	}

	rewardIcon() {
		this.resolveRandom();

		let path = "";
		switch(this.rewardType) {
			case CheckRewards.EXP: {
				path = "EXP";
				break;
			}
			case CheckRewards.Skill: {
				path = AbilityTypes[this.rewardId]?.icon ?? "";
				break;
			}
			case CheckRewards.Material: {
				path = MaterialTypes[this.rewardId]?.icon ?? "";
				break;
			}
			case CheckRewards.Item: {
				path = ItemTypes[this.rewardId]?.icon ?? "";
				break;
			}
			case CheckRewards.Upgrade: {
				path = "HeartUpgrade" ?? "HungerUpgrade";
				break;
			}
		}

		return !!path ? ImageManager.lIcon(path) : null;
	}

	rewardText() {
		this.resolveRandom();

		let text = "";
		switch(this.rewardType) {
			case CheckRewards.EXP: {
				text = "+" + this.rewardQuantity + " EXP";
				break;
			}
			case CheckRewards.Skill: {
				const name = AbilityTypes[this.rewardId]?.name ?? "";
				if(name) {
					text = name + " ability";
				}
				break;
			}
			case CheckRewards.Material: {
				const name = MaterialTypes[this.rewardId]?.name ?? "";
				if(name) {
					text = this.rewardQuantity + " " + name;
				}
				break;
			}
			case CheckRewards.Item: {
				const name = ItemTypes[this.rewardId]?.name ?? "";
				if(name) {
					text = name;
				}
				break;
			}
			case CheckRewards.Upgrade: {
				if(this.rewardId === 0) {
					text = "HP Upgrade";
				} else if(this.rewardId === 1) {
					text = "Hunger Upgrade";
				}
				break;
			}
		}

		if(!text) {
			text = "nothing";
		}

		return text;
	}

	addReward() {
		this.resolveRandom();

		switch(this.rewardType) {
			case CheckRewards.EXP: {
				if(this.rewardQuantity > 0) {
					$ppPlayer.addExp(this.rewardQuantity);
				}
				break;
			}
			case CheckRewards.Skill: {
				if(this.rewardId >= 0) {
					$ppPlayer.inventory.addActiveSkill(this.rewardId);
				}
				break;
			}
			case CheckRewards.Material: {
				if(this.rewardId >= 0 && this.rewardQuantity > 0) {
					$ppPlayer.inventory.addMaterial(this.rewardId, this.rewardQuantity);
				}
				break;
			}
			case CheckRewards.Item: {
				if(this.rewardId >= 0) {
					$ppPlayer.inventory.addItem(this.rewardId);
				}
				break;
			}
			case CheckRewards.Upgrade: {
				if(this.rewardId === 0) {
					$ppPlayer.incrementMaxHp();
				} else if(this.rewardId === 1) {
					$ppPlayer.incrementMaxHunger();
				}
				break;
			}
		}
	}

	updateChestOpen() {
		if(this._isChestOpening) {
			this._chestAni += 0.02;
			if(this._chestAni > 1) this._chestAni = 1;

			const r = this._chestAni;
			if(r < 0.33) {
				const a = (r / 0.33).quinticOut();
				this.sprite.scale.set(2 * (1 - (0.5 * a)), 2 * (1 + (0.5 * a)));
			} else if(r < 0.66) {
				const b = ((r - 0.33) / 0.33).quinticOut();
				this.sprite.scale.set(2 * (0.5 + (1 * b)), 2 * (1.5 - (1 * b)));
			} else {
				const c = ((r - 0.66) / 0.34).quinticIn();
				this.sprite.scale.set(2 * (1.5 - (0.5 * c)), 2 * (0.5 + (0.5 * c)));
			}

			if(this._chestAni >= 1) {
				this.openChestEnd();
			}
		}

		if(this._isIconShowing) {
			this._iconAni += 0.03;
			if(this._iconAni > 1) this._iconAni = 1;

			this.iconSprite.alpha = this._iconAni;
			this.iconSprite.y = this._iconAni.cubicOut() * -20;
			if(this.iconSprite.bitmap && this.iconSprite.bitmap.isReady()) {
				const w = this.iconSprite.bitmap.width;
				this.iconSprite.scale.set(w === 16 ? 1 : 2);
			}

			if(this._iconAni >= 1) {
				this.showIconEnd();
			}
		}

		if(this._isIconHiding) {
			this._iconAni += 0.07;
			if(this._iconAni > 1) this._iconAni = 1;

			this.iconSprite.alpha = 1 - this._iconAni;

			if(this._iconAni >= 1) {
				this.hideIconEnd();
			}
		}
	}
}