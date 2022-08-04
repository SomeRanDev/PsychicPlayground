class Inventory {
	static MaxPassiveSkills = 8;
	static MaxActiveSkills = 8;
	static MaxMaterials = 8;
	static MaxItems = 9;

	static HotBarItems = 9;

	static SkipEmptyHotBarSlots = false;

	constructor() {
		this.passiveSkills = new Int32Array(Inventory.MaxPassiveSkills);
		this.activeSkills = new Int32Array(Inventory.MaxActiveSkills);
		this.materials = new Int32Array(Inventory.MaxMaterials);
		this.items = new Int32Array(Inventory.MaxItems);

		this.passiveSkills.fill(-1);
		this.activeSkills.fill(-1);
		this.materials.fill(0);
		this.items.fill(-1);

		this.activeSkillAmmo = new Float32Array(AbilityTypes.length);
		this.activeSkillAmmo.fill(100);

		//this.addActiveSkill(0);
		//this.addActiveSkill(3);

		//this.addMaterial(0, 65);
		//this.addMaterial(3, 256);

		//this.addItem(0);

		this.hotbarIndex = 0;
		this.hotbar = new Int32Array(Inventory.HotBarItems);
		for(let i = 0; i < this.hotbar.length; i++) this.hotbar[i] = -1;

		/*
		this.hotbar[0] = 0;
		this.hotbar[2] = 3;
		this.hotbar[3] = 0;
		this.hotbar[4] = 1;
		this.hotbar[5] = 2;
		this.hotbar[6] = 0;
		*/

		this.verifyHotbarOptions();
	}

	verifyHotbarOptions() {
		for(let i = 0; i <= 2; i++) {
			const skillId = this.hotbar[i];
			if(!this.hasActiveSkill(skillId)) {
				this.hotbar[i] = -1;
			}
		}
		for(let i = 3; i <= 5; i++) {
			const materialId = this.hotbar[i];
			if(!this.hasMaterial(materialId)) {
				this.hotbar[i] = -1;
			}
		}
		for(let i = 6; i <= 8; i++) {
			const itemId = this.hotbar[i];
			if(!this.hasItem(itemId)) {
				this.hotbar[i] = -1;
			}
		}
	}

	saveData() {
		return [
			Array.from(this.passiveSkills),
			Array.from(this.activeSkills),
			Array.from(this.materials),
			Array.from(this.items),
			Array.from(this.activeSkillAmmo),
			this.hotbarIndex,
			Array.from(this.hotbar)
		];
	}

	loadData(data) {
		this.passiveSkills = Int32Array.from(data[0]);
		this.activeSkills = Int32Array.from(data[1]);
		this.materials = Int32Array.from(data[2]);
		this.items = Int32Array.from(data[3]);
		this.activeSkillAmmo = Float32Array.from(data[4]);

		this.hotbarIndex = data[5];

		this.hotbar = Int32Array.from(data[6]);
	}

	update() {
		this.updateHotbarInput();
		this.updateCooldowns();
	}

	updateCooldowns() {
		let changed = false;
		const len = this.activeSkillAmmo.length;
		for(let i = 0; i < len; i++) {
			if(this.activeSkillAmmo[i] < 100) {
				this.activeSkillAmmo[i] += ((AbilityTypes[i].cooldownSpeed ?? 1) * $ppPlayer.calcCooldownMultiplier());
				if(this.activeSkillAmmo[i] > 100) {
					this.activeSkillAmmo[i] = 100;
				}
				changed = true;
			}
		}
		if(changed) {
			$ppPlayer.refreshHotbarNumbers();
			if(SceneManager._scene.updateCursorSkillBar) {
				SceneManager._scene.updateCursorSkillBar();
			}
		}
	}

	isMining() {
		return this.hotbarIndex <= 2 && this.hotbar[this.hotbarIndex] >= 0 && this.hotbar[this.hotbarIndex] <= 2;
	}

	isMaterial() {
		return this.hotbarIndex >= 3 && this.hotbarIndex <= 5 && this.hotbar[this.hotbarIndex] >= 0;
	}

	isSkill() {
		return this.hotbarIndex <= 2 && this.hotbar[this.hotbarIndex] >= 0;
	}

	holdingSkill() {
		if(this.hotbarIndex <= 2) {
			const skillId = this.hotbar[this.hotbarIndex];
			return skillId;
		}
		return -1;
	}

	hasUsableSkill() {
		const holdingSkillId = this.holdingSkill();
		if(holdingSkillId !== -1) {
			const abilityData = AbilityTypes[holdingSkillId];
			if(abilityData?.isBool) {
				if(TouchInput.isTriggered()) {
					return abilityData?.behavior ?? null;
				}
			} else if(abilityData?.requireNoCooldown) {
				if(this.getSkillCooldown(holdingSkillId) >= 100) {
					return abilityData?.behavior ?? null;
				} else {
					return null;
				}
			} else {
				return abilityData?.behavior ?? null;
			}
		}
		return null;
	}

	holdingItem() {
		if(this.hotbarIndex >= 6) {
			const itemId = this.hotbar[this.hotbarIndex];
			return itemId;
		}
		return -1;
	}

	hasUsableItem() {
		const holdingItemId = this.holdingItem();
		if(holdingItemId !== -1) {
			return ItemTypes[holdingItemId]?.behavior ?? null;
		}
		return null;
	}

	isFood() {
		if(this.hotbarIndex >= 6) {
			const itemId = this.hotbar[this.hotbarIndex];
			return ItemTypes[itemId]?.isFood ?? false;
		}
		return false;
	}

	hasPlacableMaterial() {
		if(this.hotbarIndex >= 3 && this.hotbarIndex <= 5) {
			const matId = this.hotbar[this.hotbarIndex];
			if(matId >= 0) {
				return this.hasMaterial(matId, MaterialTypes[matId]?.buildCost ?? 0) ? matId : null;
			}
		}
		return null;
	}

	hasShootableMaterial() {
		if(this.hotbarIndex >= 3 && this.hotbarIndex <= 5) {
			const matId = this.hotbar[this.hotbarIndex];
			if(matId >= 0) {
				return this.hasMaterial(matId, MaterialTypes[matId]?.shootCost ?? 1) ? matId : null;
			}
		}
		return null;
	}

	getMaterialCount() {
		if(this.hotbarIndex >= 3 && this.hotbarIndex <= 5) {
			const matId = this.hotbar[this.hotbarIndex];
			if(matId >= 0) {
				return this.materials[matId];
			}
		}
		return 0;
	}

	getSkillCount() {
		if(this.hotbarIndex <= 2) {
			return this.getSlotNumber(this.hotbarIndex);
		}
		return "";
	}

	maxBuildAmount() {
		if(this.hotbarIndex >= 3 && this.hotbarIndex <= 5) {
			const matId = this.hotbar[this.hotbarIndex];
			if(matId >= 0) {
				const buildCost = MaterialTypes[matId]?.buildCost || 1;
				const materialCount = this.materials[matId];
				return Math.floor(materialCount / buildCost);
			}
		}
		return 0;
	}

	onBuild(count = 1) {
		if(this.hotbarIndex >= 3 && this.hotbarIndex <= 5) {
			const matId = this.hotbar[this.hotbarIndex];
			const matData = MaterialTypes[matId];
			const buildCost = $ppPlayer.calcBuildCost(matData?.buildCost ?? 0);
			if(this.hasMaterial(matId, buildCost)) {
				this.addMaterial(matId, -(buildCost * count));
				$ppPlayer.showPopup("-" + (buildCost * count) + " " + matData.name);
			} else {
				const name = matData.name;
				if(!this._lastNoMaterial) {
					this._lastNoMaterial = {
						mat: name,
						time: -9999
					};
				}
				if(
					this._lastNoMaterial.name !== name ||
					this._lastNoMaterial.time + 40 < Graphics.frameCount
				) {
					$ppPlayer.showPopup("Not enough " + name + ".");

					this._lastNoMaterial.name = name;
					this._lastNoMaterial.time = Graphics.frameCount;
				}
			}
		}
	}

	placeMaterial() {
		if(this.hasPlacableMaterial()) {
			const matId = this.hotbar[this.hotbarIndex];
			const matData = MaterialTypes[matId];
			const buildCost = matData?.buildCost ?? 0;
			return matId;
		}
		return -1;
	}

	_updateCursor() {
		if(SceneManager._scene.updateCursorSkillBar) {
			SceneManager._scene.updateCursorSkillBar();
		}
		if(SceneManager._scene.updateCursorQuantity) {
			SceneManager._scene.updateCursorQuantity();
		}
	}

	updateHotbarInput() {
		if(!$ppPlayer.canMove()) return;
		if(TouchInput.wheelScrolled > 0) {
			this.incrementHotbarIndex();
			this._updateCursor();
		} else if(TouchInput.wheelScrolled < 0) {
			this.decrementHotbarIndex();
			this._updateCursor();
		} else {
			for(let i = 1; i <= 9; i++) {
				if(Input.isTriggeredEx("" + i)) {
					this.hotbarIndex = i - 1;
					break;
				}
			}
		}
	}

	incrementHotbarIndex() {
		if(Inventory.SkipEmptyHotBarSlots) {
			let next = -1;
			for(let i = this.hotbarIndex + 1; i < Inventory.HotBarItems; i++) {
				if(this.hotbar[i] !== -1) {
					next = i;
					break;
				}
			}
			if(next === -1) {
				for(let i = 0; i < this.hotbarIndex; i++) {
					if(this.hotbar[i] !== -1) {
						next = i;
						break;
					}
				}
			}
			if(next !== -1) {
				this.hotbarIndex = next;
			}
		} else {
			this.hotbarIndex++;
			if(this.hotbarIndex >= Inventory.HotBarItems) {
				this.hotbarIndex = 0;
			}
		}
	}

	decrementHotbarIndex() {
		if(Inventory.SkipEmptyHotBarSlots) {
			let next = -1;
			for(let i = this.hotbarIndex - 1; i >= 0; i--) {
				if(this.hotbar[i] !== -1) {
					next = i;
					break;
				}
			}
			if(next === -1) {
				for(let i = Inventory.HotBarItems - 1; i > this.hotbarIndex; i--) {
					if(this.hotbar[i] !== -1) {
						next = i;
						break;
					}
				}
			}
			if(next !== -1) {
				this.hotbarIndex = next;
			}
		} else {
			this.hotbarIndex--;
			if(this.hotbarIndex < 0) {
				this.hotbarIndex = Inventory.HotBarItems - 1;
			}
		}
	}

	getSlotNumber(slotIndex) {
		const id = this.hotbar[slotIndex];
		if(id === -1) {
			return null;
		} else if(slotIndex <= 2) {
			return this.getAbilityNumber(id);
		} else if(slotIndex <= 5) {
			return this.materials[id];
		} else if(slotIndex <= 8) {
			const count = this.getItemCount(id);
			return count > 1 ? count : null;
		}
		return null;
	}

	getAbilityNumber(skillId) {
		if(AbilityTypes[skillId]?.isBool) {
			return AbilityTypes[skillId].getBool() ? "ON" : "OFF";
		}
		if(this.activeSkillAmmo[skillId] < 100) {
			return Math.floor(this.activeSkillAmmo[skillId]) + "%";
		}
		return null;
	}

	addPassiveSkill(skillId) {
		for(let i = 0; i < this.passiveSkills.length; i++) {
			if(this.passiveSkills[i] === -1) {
				this.passiveSkills[i] = skillId;
				return true;
			}
		}
		return false;
	}

	hasPassiveSkill(skillId) {
		return this.passiveSkills.includes(skillId);
	}

	addActiveSkill(skillId) {
		for(let i = 0; i < this.activeSkills.length; i++) {
			if(this.activeSkills[i] === -1) {
				this.activeSkills[i] = skillId;
				this.sortSkills();
				return true;
			}
		}
		return false;
	}

	addActiveSkillFromName(name) {
		const len = AbilityTypes.length;
		for(let i = 0; i < len; i++) {
			if(AbilityTypes[i]?.name === name) {
				this.addActiveSkill(i);
				return true;
			}
		}
		return false;
	}

	removeActiveSkill(skillId) {
		if(this.hasActiveSkill(skillId)) {
			this.activeSkills[this.activeSkills.indexOf(skillId)] = -1;
			this.sortSkills();
			return true;
		}
		return false;
	}

	hasActiveSkill(skillId) {
		return this.activeSkills.includes(skillId);
	}

	sortSkills() {
		this.activeSkills.sort((a, b) => {
			if(a === -1) return 1;
			else if(b === -1) return -1;
			return a - b;
		});
	}

	getAbilityCooldown() {
		if(this.hotbarIndex <= 2) {
			const skillId = this.hotbar[this.hotbarIndex];
			if(skillId >= 0) {
				return this.activeSkillAmmo[skillId];
			}
		}
		return -1;
	}

	addMaterial(materialId, amount = 1) {
		const old = this.materials[materialId];
		this.materials[materialId] += amount;
		if(this.materials[materialId] > MaterialTypes[materialId].max) {
			this.materials[materialId] = MaterialTypes[materialId].max;
		}
		if(this.materials[materialId] <= 0) {
			this.materials[materialId] = 0;
			if($ppPlayer && !ImageManager.IsTwitter) {
				this.verifyHotbarOptions();
				$ppPlayer.refreshHotbarIcons();
				$ppPlayer.refreshInventorySlots();
			}
		}
		if($ppPlayer && !ImageManager.IsTwitter) {
			$ppPlayer.refreshHotbarNumbers();
			if(SceneManager._scene.updateCursorQuantity) {
				SceneManager._scene.updateCursorQuantity();
			}
		}
		return this.materials[materialId] !== old;
	}

	hasMaterial(materialId, amount = 1) {
		return this.materials[materialId] >= amount;
	}

	addItem(itemId) {
		const emptyIndex = this.items.indexOf(-1);
		if(emptyIndex !== -1) {
			this.items[emptyIndex] = itemId;
			this.sortItems();
			this.refreshAllHotbar();
			return true;
		}
		return false;
	}

	removeItem(itemId) {
		if(this.hasItem(itemId)) {
			const index = this.items.indexOf(itemId);
			if(index >= 0) {
				this.items[index] = -1;
				this.sortItems();
				this.refreshAllHotbar();
				return true;
			}
		}
		return false;
	}

	hasItem(itemId) {
		return this.items.includes(itemId);
	}

	sortItems() {
		this.items.sort((a, b) => {
			if(a === -1) return 1;
			else if(b === -1) return -1;
			return a - b;
		});
	}

	getItemCount(itemId) {
		let result = 0;
		for(let i = 0; i < this.items.length; i++) {
			if(this.items[i] === itemId) {
				result++;
			}
		}
		return result;
	}

	hasRoomForItem() {
		return this.hasItem(-1);
	}

	consumeHotbarItem() {
		const item = this.holdingItem();
		this.removeItem(item);
		if(!this.hasItem(item)) {
			this.clearHotbarIndex(this.hotbarIndex);
		}
	}

	startCooldownSkill() {
		const skill = this.holdingSkill();
		if(this.hasActiveSkill(skill)) {
			this.setSkillCooldown(skill, 0);
		}
	}

	getSkillCooldown(skillId) {
		return this.activeSkillAmmo[skillId];
	}

	setSkillCooldown(skillId, cooldownAmount) {
		this.activeSkillAmmo[skillId] = cooldownAmount;
		if(this.activeSkillAmmo[skillId] < 0) {
			this.activeSkillAmmo[skillId] = 0;
		}
		$ppPlayer.refreshHotbarNumbers();
		return this.activeSkillAmmo[skillId] !== 0;
	}

	addSkillCooldown(skillId, cooldownChange) {
		return this.setSkillCooldown(skillId, this.activeSkillAmmo[skillId] + cooldownChange);
	}

	onHotbar(index, id) {
		for(let i = index * 3; i < (index + 1) * 3; i++) {
			if(this.hotbar[i] === id) {
				return true;
			}
		}
		return false;
	}

	clearHotbarIndex(index) {
		this.hotbar[index] = -1;
		this.refreshAllHotbar();
	}

	setHotbarIndex(index, id) {
		let oldSlot = -1;
		const start = Math.floor(index / 3) * 3;
		for(let i = start; i < start + 3; i++) {
			if(this.hotbar[i] === id) {
				this.hotbar[i] = -1;
				oldSlot = i;
			}
		}
		if(oldSlot !== -1) {
			this.hotbar[oldSlot] = this.hotbar[index];
		}
		this.hotbar[index] = id;
		this.refreshAllHotbar();
	}

	refreshAllHotbar() {
		if($ppPlayer && !ImageManager.IsTwitter) {
			this.verifyHotbarOptions();
			$ppPlayer.refreshHotbarNumbers();
			$ppPlayer.refreshHotbarIcons();
		}
	}

	getRandomNewSkill() {
		if(this.activeSkills.includes(-1)) {
			const unknownSkills = [];
			for(let i = 3; i < AbilityTypes.length; i++) {
				if(!this.activeSkills.includes(i) && AbilityTypes[i]?.name) {
					unknownSkills.push(i);
				}
			}
			if(unknownSkills.length > 0) {
				const skillId = unknownSkills[Math.floor(Math.random() * unknownSkills.length)];
				$gameTemp._randomlyGainedSkillName = AbilityTypes[skillId].name;
				return skillId;
			}
		}
		return -1;
	}

	gainRandomNewSkill() {
		const skill = this.getRandomNewSkill();
		if(skill !== -1) {
			this.addActiveSkill(skill);
			return skill;
		}
		return -1;
	}

	getRandomItem() {
		if(this.activeSkills.includes(-1)) {
			const possibleItems = [];
			for(let i = 0; i < ItemTypes.length; i++) {
				if(ItemTypes[i].allowChestFind) {
					possibleItems.push(i);
				}
			}
			if(possibleItems.length > 0) {
				return possibleItems[Math.floor(Math.random() * possibleItems.length)];
			}
		}
		return -1;
	}
}