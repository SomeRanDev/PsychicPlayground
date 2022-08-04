class Hotbar extends Sprite {
	constructor() {
		super();

		this._selectedIndex = -1;
		this._menuOpenness = 0;
		this._menuOpen = false;
		this._dragItem = null;
		this._dragItemReturn = false;
		this._dragOffsetX = 0;
		this._dragOffsetY = 0;

		this._xSprites = [];

		this._pieces = [
			this.makeHotbarPiece("SkillsHotbar", 0),
			this.makeHotbarPiece("MaterialsHotbar", 1),
			this.makeHotbarPiece("ItemsHotbar", 2),
		];

		this._toolTips = [
			this.makeToolTip(0),
			this.makeToolTip(1),
			this.makeToolTip(2)
		];

		this._toolTipText = ["", "", ""];

		this.anchor.set(0.5, 1);
		this.move(Graphics.width / 2, Graphics.height - 10);

		this._hotbarSlots = [];
		for(let i = 0; i < 9; i++) {
			this.makeHotbarSlot(i);
		}

		this.refreshIcons();
		this.refreshNumbers();

		this.statMenu = new PlayerStatMenu();
		this.statMenu.y = -140;
		this.statMenu.visible = false;
		this.addChild(this.statMenu);

		SpriteManager.addUi(this);
	}

	makeHotbarPiece(path, index) {
		const piece = new Sprite();
		piece.anchor.set(0.5, 1);
		piece.scale.set(2);
		piece.move(index === 0 ? -110 : (index === 1 ? 0 : 110), 41 * 2);
		this.addChild(piece);

		const pieceLabel = new Sprite(ImageManager.lUi(path + "_Label"));
		pieceLabel.anchor.set(0.5, 0);
		pieceLabel.move(0, -106);
		piece._label = pieceLabel;
		piece.addChild(pieceLabel);
		
		this.createPieceList(path, piece, index);

		const pieceDisplay = new Sprite(ImageManager.lUi(path));
		pieceDisplay.anchor.set(0.5, 1);
		piece.addChild(pieceDisplay);

		return piece;
	}

	createPieceList(path, piece, index) {
		const pieceList = new Sprite(ImageManager.lUi(path + "_List"));
		pieceList.anchor.set(0.5, 1);
		pieceList.move(0, -106);
		pieceList.visible = false;
		piece._list = pieceList;
		piece.addChild(pieceList);

		const listSlots = [];
		for(let y = 2; y >= 0; y--) {
			for(let x = -1; x <= 1; x++) {
				const s = new Sprite();
				s.anchor.set(0.5);
				s.move((13 * x), -8 + (-13  * y));
				s._baseX = s.x;
				s._baseY = s.y;
				s._hoverRatio = 0;
				s._hotbarIndex = index;
				s.visible = false;

				const t = PP.makeText("", 6);
				t.resolution = 5;
				t.anchor.set(1, 1);
				t.style.align = "right";
				t.scaleMode = PIXI.SCALE_MODES.NEAREST;
				t.move(8, 8);
				s.addChild(t);
				s._text = t;

				pieceList.addChild(s);
				listSlots.push(s);
			}
		}

		if(index === 0) {
			this._skillListSlots = listSlots;
		} else if(index === 1) {
			this._materialListSlots = listSlots;
		} else if(index === 2) {
			this._itemListSlots = listSlots;
		}

		piece._listSlots = listSlots;

		return pieceList;
	}

	makeHotbarSlot(index) {
		const slot = new DynamicBitmapShifter();
		slot.anchor.set(0.5, 1);

		slot._selected = false;
		slot._ratio = 0;

		const barIndex = Math.floor(index / 3);
		slot.move((((index % 3) - 1) * 15), (-12) - (41));
		slot._baseY = slot.y;

		this.makeHotbarSlotShine(slot, barIndex);

		this._pieces[barIndex].addChild(slot);
		this._hotbarSlots.push(slot);

		this.makeHotbarSlotNumber(slot, barIndex);
		this.makeHotbarSlotX(slot, index, barIndex);
	}

	makeHotbarSlotShine(slot, barIndex) {
		const shine = new Sprite(ImageManager.lUi("HotbarShine"));
		shine.anchor.set(0.5, 1);
		shine.move(slot.x, slot.y);
		shine.alpha = 0.25;

		this._pieces[barIndex].addChild(shine);
		slot._shine = shine;
	}

	makeHotbarSlotNumber(slot, barIndex) {
		const text = PP.makeText("", 6);
		text.anchor.set(1, 1);
		text.style.align = "right";
		text.resolution = 5;
		text.scaleMode = PIXI.SCALE_MODES.NEAREST;
		text.move(slot.x + 8, slot.y + 6);
		text.visible = false;

		this._pieces[barIndex].addChild(text);
		slot._text = text;
	}

	makeHotbarSlotX(slot, index, barIndex) {
		const x = new Sprite(ImageManager.lUi("X"));
		x.anchor.set(0.5);
		x.move(slot.x + 0, slot.y - 16);
		x.alpha = 0;
		x.tint = 0xcccccc;

		this._xSprites[index] = x;

		this._pieces[barIndex].addChild(x);
	}

	makeToolTip(index) {
		const toolTip = new HotbarToolTip(index);
		toolTip.x = (toolTip.width / -4);
		toolTip.y = 8;
		toolTip.scale.set(0.5);
		this._pieces[index].addChild(toolTip);
		return toolTip;
	}

	update() {
		this.updateSelection();
		this.updateSlots();
		this.updateMenuOpen();
		this.updateMenuAnimation();
		this.updateMenuInteraction();
		this.updateToolTip();
	}

	updateSelection() {
		const inv = $ppPlayer.inventory;
		if(inv) {
			if(this._selectedIndex !== inv.hotbarIndex) {
				if(this._selectedIndex >= 0 && this._selectedIndex < this._hotbarSlots.length) {
					this._hotbarSlots[this._selectedIndex]._selected = false;
				}
				this._selectedIndex = inv.hotbarIndex;
				if(this._selectedIndex >= 0 && this._selectedIndex < this._hotbarSlots.length) {
					this._hotbarSlots[this._selectedIndex]._selected = true;
				}
			}
		}
	}

	updateSlots() {
		for(const slot of this._hotbarSlots) {
			if(slot.update) {
				slot.update();
			}

			slot._ratio = slot._ratio.moveTowardsCond(slot._selected, 0, 1, slot._selected ? 0.08 : 0.1);
			if(slot._ratio !== 0) {
				this._updateSlotAnimation(slot);
			} else {
				this._resetSlotAnimation(slot);
			}
		}
	}

	_updateSlotAnimation(slot) {
		let r = slot._ratio;
		if(slot._selected) {
			if(r < 0.7) {
				r = (r / 0.5).cubicOut() * 1.5;
			} else {
				r = 1.0 + ((1 - ((r - 0.5) / 0.5)).cubicOut() * 0.5);
			}
		}
		slot.y = slot._baseY - (3 * r);
		slot._shine.alpha = 0.25 + ((slot._ratio / 0.7).clamp(0, 1) * 0.75);

		if(slot._text.visible) {
			const text = slot._text;
			const tr = (slot._ratio / 0.6).clamp(0, 1);
			text.move((slot.x + 8) + (-3 * tr), (slot.y + 6) + (1 * tr));
		}
	}

	_resetSlotAnimation(slot) {
		slot.y = slot._baseY;
		slot._shine.alpha = 0.25;
		if(slot._text.visible) {
			slot._text.move(slot.x + 8, slot.y + 6);
		}
	}

	updateMenuOpen() {
		if(this._menuOpen !== $gameMap.isInvPause()) {
			this._menuOpen = $gameMap.isInvPause();
			if(this._menuOpen) {
				this.onMenuOpen();
			} else {
				this.onMenuClose();
			}
		}
	}

	onMenuOpen() {
		this._showStatMenu = $ppPlayer.statPoints > 0;
		if(this._showStatMenu) {
			this.statMenu.refreshStatInputs()
		}

		this.refreshInventoryListSlots();
	}

	onMenuClose() {
		if(this._showStatMenu && this.statMenu.applyStatInputs()) {
			playSe("LevelsSpent", 200);
		} else {
			playSe("InventoryClose", 200);
		}

		this.closeAllToolTips();
	}

	updateMenuAnimation() {
		if(this._menuOpen && this._menuOpenness < 1) {
			this.setMenuOpenness(this._menuOpenness + 0.05);
		} else if(!this._menuOpen && this._menuOpenness > 0) {
			this.setMenuOpenness(this._menuOpenness - 0.05);
		}
	}

	menuReady() {
		return this._menuOpenness >= 1;
	}

	refreshIcons() {
		const inv = $ppPlayer.inventory;
		if(inv) {
			const hotbar = inv.hotbar;
			for(let i = 0; i < hotbar.length; i++) {
				const icon = this.findIcon(hotbar[i], i);
				const slot = this._hotbarSlots[i];
				slot.setBitmap(icon === null ? null : ImageManager.lIcon(icon));
				//slot.visible = !!slot.bitmap;
				this._xSprites[i].visible = slot.hasBitmap();
			}
		}
	}

	findIcon(id, index) {
		if(index === -1) {
			return null;
		}
		switch(Math.floor(index / 3)) {
			case 0: return this.findAbilityIcon(id);
			case 1: return this.findMaterialIcon(id);
			case 2: return this.findItemIcon(id);
		}
	}

	findAbilityIcon(id) {
		return AbilityTypes[id]?.icon ?? null;
	}

	findMaterialIcon(id) {
		return MaterialTypes[id]?.icon ?? null;
	}

	findItemIcon(id) {
		return ItemTypes[id]?.icon ?? null;
	}

	refreshNumbers() {
		const inv = $ppPlayer.inventory;
		if(inv) {
			const hotbar = inv.hotbar;
			for(let i = 0; i < hotbar.length; i++) {
				const text = inv.getSlotNumber(i);
				const textSpr = this._hotbarSlots[i]._text;
				if(text === null) {
					textSpr.text = "";
					textSpr.visible = false;
				} else {
					textSpr.text = text;
					textSpr.visible = true;
				}
			}
		}
	}

	refreshHotbar() {
		this.refreshIcons();
		this.refreshNumbers();
		this.refreshInventoryListSlots();
	}

	setMenuOpenness(r) {
		r = r.clamp(0, 1);
		if(this._menuOpenness !== r) {
			this._menuOpenness = r;

			const rc = this._menuOpen ? r.cubicOut() : r.cubicIn();

			if(this._showStatMenu) {
				this.statMenu.y = -675 + (300 * rc);
				this.statMenu.visible = r !== 0;
			}

			let i = 0;
			for(const piece of this._pieces) {
				piece.x = ((i === 0 ? -110 : (i === 1 ? 0 : 110)) * (1 + (0.4 * rc)))
				piece.y = ((41 * 2) * (1 - rc)) - (90 * rc);

				piece._label.y = PP.lerpEx(-106, -65, rc);

				const h = Math.ceil(41 * rc);

				for(const listSlot of piece._listSlots) {
					const comp = Math.abs(listSlot._baseY + 8);
					const r = (h > comp) ? ((h - comp) / 13).clamp(0, 1) : 0;
					if(r === 1) {
						listSlot.y = listSlot._baseY;
						listSlot.setFrame(0, 0, 8, 8);
						listSlot.visible = true;
					} else if(r === 0) {
						listSlot.visible = false;
					} else {
						listSlot.y = listSlot._baseY + ((1 - r) * 4);
						listSlot.setFrame(0, (8 - (8 * r)), 8, r * 8);
						listSlot.visible = true;
					}
				}

				const list = piece._list;
				list.y = -49 + (41 * rc);
				list.setFrame(0, 16 + (41 - h), list.bitmap.width, h);
				list.visible = r !== 0;

				i++;
			}

			for(let i = 0; i < 9; i++) {
				this._xSprites[i].alpha = rc;
			}
		}
	}

	refreshInventoryListSlots() {
		const inv = $ppPlayer.inventory;
		if(inv) {
			this.refreshSkillsInventory(inv);
			this.refreshMaterialsInventory(inv);
			this.refreshItemsInventory(inv);
		}
	}

	refreshSkillsInventory(inv) {
		if(this._skillListSlots) {
			const len = inv.activeSkills.length;
			for(let i = 0; i < len; i++) {
				const skillId = inv.activeSkills[i];
				const skillData = skillId === -1 ? null : AbilityTypes[skillId];
				const slot = this._skillListSlots[i];
				slot._dataId = skillId;
				if(skillData) {
					slot.bitmap = ImageManager.lIcon(skillData.icon);
					slot.visible = true;
				} else {
					slot.visible = false;
				}

				const text = inv.getAbilityNumber(skillId);
				if(!text) {
					slot._text.visible = false;
				} else {
					slot._text.text = text;
					slot._text.visible = true;
				}

				slot.tint = inv.onHotbar(0, skillId) ? 0x444444 : 0xffffff;
			}
		}
	}

	refreshMaterialsInventory(inv) {
		if(this._materialListSlots) {
			const len = inv.materials.length;
			let index = 0;
			for(let i = 0; i < len; i++) {
				const materialAmount = inv.materials[i];

				if(materialAmount <= 0) {
					continue;
				}

				const slot = this._materialListSlots[index];
				slot._dataId = i;

				const materialData = MaterialTypes[i];
				if(materialData) {
					slot.bitmap = ImageManager.lIcon(materialData.icon);
					slot.visible = true;
				} else {
					slot.visible = false;
				}

				const text = "" + materialAmount;
				if(!text) {
					slot._text.visible = false;
				} else {
					slot._text.text = text;
					slot._text.visible = true;
				}

				slot.tint = inv.onHotbar(1, i) ? 0x444444 : 0xffffff;

				index++;
			}

			for(let i = index; i < len; i++) {
				this._materialListSlots[i].bitmap = null;
				this._materialListSlots[i]._text.visible = false;
			}
		}
	}

	refreshItemsInventory(inv) {
		if(this._itemListSlots) {
			const len = inv.items.length;
			for(let i = 0; i < len; i++) {
				const itemId = inv.items[i];
				const slot = this._itemListSlots[i];
				slot._dataId = itemId;
				const itemData = itemId === -1 ? null : ItemTypes[itemId];
				if(itemData) {
					slot.bitmap = ImageManager.lIcon(itemData.icon);
					slot.visible = true;
				} else {
					slot.bitmap = null;
					slot.visible = false;
				}
				slot.tint = inv.onHotbar(2, itemId) ? 0x444444 : 0xffffff;
			}
		}
	}

	canInteractWithMenu() {
		return this._menuOpen && TouchInput.mouseInside && this.menuReady() && this._dragItem === null;
	}

	updateMenuInteraction() {
		if(this.canInteractWithMenu()) {
			if(this._showStatMenu) {
				this.statMenu.update();
			}
			this.updateMenuHover();
		} else if(this._dragItem !== null) {
			this.updateMenuDrag();
		}
	}

	updateMenuHover() {
		let hoverIndex = -1;
		let localPos;
		for(let i = 0; i < 3; i++) {
			const touchPos = new Point(TouchInput.x, TouchInput.y);
			localPos = this._pieces[i]._list.worldTransform.applyInverse(touchPos);

			if(localPos.x < 23 && localPos.x > -23 && localPos.y < 10 && localPos.y > -70) {
				hoverIndex = i;
				if(localPos.y < -41) {
					this._toolTips[i].setDataId(-1);
				}
				break;
			} else {
				this._toolTips[i].setDataId(-1);
				this.updateMenuListInteractionNoHover(i);
			}
		}

		for(let i = hoverIndex + 1; i < 3; i++) {
			this._toolTips[i].setDataId(-1);
			this.updateMenuListInteractionNoHover(i);
		}

		const xHoverIndex = this.updateXSprites(hoverIndex, localPos);

		if(hoverIndex !== -1) {
			const hoveredItem = this.updateMenuListInteraction(hoverIndex, localPos);
			if(TouchInput.isTriggered()) {
				if(hoveredItem) {
					this._dragItem = hoveredItem;
					this._dragItemParent = this._dragItem.parent;
					this._dragOffsetX = this._dragItem.x - localPos.x;
					this._dragOffsetY = this._dragItem.y - localPos.y;
					this._dragItemParent.removeChild(this._dragItem);
					this.addChild(this._dragItem);
					this._dragItem.scale.set(2);
					this.updateDragItemPosition();
				} else if(xHoverIndex !== -1) {
					$ppPlayer.inventory.clearHotbarIndex(xHoverIndex);
					playSe("HotbarRemove");
					this.refreshHotbar();
				}
			}
		}
	}

	updateXSprites(hoverIndex, localPos) {
		let xHoverIndex = -1;
		if(hoverIndex !== -1) {
			if(localPos.y <= -57 && localPos.y >= -65) {
				const x = Math.floor((localPos.x - 7) / 14) + 1;
				if(x === -1 || x === 0 || x === 1) {
					xHoverIndex = (hoverIndex * 3) + (x / 1) + 1;
				}
			}
		}
		for(let i = 0; i < 9; i++) {
			this._xSprites[i].tint = (xHoverIndex === i) ? 0xffffff : 0xcccccc;
		}
		return xHoverIndex;
	}

	updateMenuDrag() {
		for(let i = 0; i < 3; i++) {
			this.updateMenuListInteractionNoHover(i);
		}

		if(this._dragItemReturn) {
			this._dragItem.x = PP.lerp(this._dragItem.x, this._dragItem._baseX, 0.8);
			this._dragItem.y = PP.lerp(this._dragItem.y, this._dragItem._baseY, 0.8);
			if(this._dragItem.alpha < 1) this._dragItem.alpha += 0.05;
			if(this._dragItem.x === this._dragItem._baseX && this._dragItem.y === this._dragItem._baseY && this._dragItem.alpha >= 1) {
				this._dragItem = null;
				this._dragItemReturn = false;
			}
		} else if(TouchInput.isReleased()) {
			this._dragItemReturn = true;

			this._dragItem.scale.set(1);
			this.removeChild(this._dragItem);
			this._dragItemParent.addChild(this._dragItem);

			this.updateDragItemPosition();

			const touchPos = new Point(TouchInput.x, TouchInput.y);
			const pos = this._dragItem.parent.worldTransform.applyInverse(touchPos);
			if(pos.y < -42 && pos.y > -60) {
				const index = Math.floor((pos.x + 8) / 16);
				if(index >= -1 && index <= 1) {
					this._dragItem.x = this._dragItem._baseX;
					this._dragItem.y = this._dragItem._baseY;
					this._dragItem.alpha = 0;
					this._dragItem.tint = 0x444444;

					const hotbarIndex = (this._dragItem._hotbarIndex * 3) + (index + 1);
					$ppPlayer.inventory.setHotbarIndex(hotbarIndex, this._dragItem._dataId);
					playSe("HotbarAdd");
					this.refreshHotbar();
				}
			}
		} else {
			this.updateDragItemPosition();
		}
	}

	updateDragItemPosition() {
		const touchPos = new Point(TouchInput.x, TouchInput.y);
		const pos = this._dragItem.parent.worldTransform.applyInverse(touchPos);
		this._dragItem.move(pos.x + this._dragOffsetX, pos.y + this._dragOffsetY + this._dragItem._hoverRatio);
	}

	updateMenuListInteraction(index, mousePos) {
		let result = null;
		const slots = this._pieces[index]._listSlots;
		for(const slot of slots) {
			const hovered = (
				(mousePos.x > (slot.x - 5)) &&
				(mousePos.y > (slot.y - 5)) &&
				(mousePos.x < (slot.x + 5)) &&
				(mousePos.y < (slot.y + 5))
			);

			const ratio = slot._hoverRatio.moveTowardsCond(hovered, 0, 1, 0.3);
			if(slot._hoverRatio !== ratio) {
				slot._hoverRatio = ratio;
				slot.y = slot._baseY + (1 * ratio);
			}

			if(hovered) {
				result = slot;
				this._toolTips[index].setDataId(slot._dataId);
			}
		}
		return result;
	}

	updateMenuListInteractionNoHover(index) {
		const slots = this._pieces[index]._listSlots;
		for(const slot of slots) {
			const ratio = slot._hoverRatio.moveTowardsCond(false, 0, 1, 0.3);
			if(slot._hoverRatio !== ratio) {
				slot._hoverRatio = ratio;
				slot.y = slot._baseY + (1 * ratio);
			}
		}
	}

	updateToolTip() {
		if(this._menuOpen) {
			const len = this._toolTips.length;
			for(let i = 0; i < len; i++) {
				const toolTip = this._toolTips[i];
				toolTip.update();
			}
		}
	}

	closeAllToolTips() {
		const len = this._toolTips.length;
		for(let i = 0; i < len; i++) {
			this._toolTips[i].setDataId(-1);
			this._toolTips[i].setFakeOpenness(0);
		}
	}
}