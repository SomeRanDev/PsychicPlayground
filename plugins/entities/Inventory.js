class Inventory {
	static MaxPassiveSkills = 8;
	static MaxActiveSkills = 8;
	static MaxMaterials = 8;
	static MaxItems = 16;

	constructor() {
		this.passiveSkills = new Int32Array(Inventory.MaxPassiveSkills);
		this.activeSkills = new Int32Array(Inventory.MaxActiveSkills);
		this.materials = new Int32Array(Inventory.MaxMaterials);
		this.items = new Int32Array(Inventory.MaxItems);
	}

	save() {
		return [
			Array.from(this.passiveSkills),
			Array.from(this.activeSkills),
			Array.from(this.materials),
			Array.from(this.items)
		];
	}

	load(data) {
		this.passiveSkills = TypedArray.from(data[0]);
		this.activeSkills = TypedArray.from(data[1]);
		this.materials = TypedArray.from(data[2]);
		this.items = TypedArray.from(data[3]);
	}

	addPassiveSkill(skillId) {
		for(let i = 0; i < this.passiveSkills.length; i++) {
			if(this.passiveSkills[i] === 0) {
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
			if(this.activeSkills[i] === 0) {
				this.activeSkills[i] = skillId;
				return true;
			}
		}
		return false;
	}

	hasActiveSkill(skillId) {
		return this.activeSkills.includes(skillId);
	}

	addMaterial(materialId, amount = 1) {
		this.materials[materialId] += amount;
		if(this.materials[materialId] > MaterialTypes[materialId].max) {
			this.materials[materialId] = MaterialTypes[materialId].max;
		}
	}

	hasMaterial(materialId, amount = 1) {
		return this.materials[materialId] >= amount;
	}
}