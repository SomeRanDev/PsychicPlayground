modify_Game_Map = class {
	initialize() {
		PP.Game_Map.initialize.apply(this, arguments);
		this.CameraOffsetX = 0;
		this.CameraOffsetY = 0;
		this.IsPaused = false;
		this.PauseMode = -1;

		$gameTemp.updateEntities = [];
		$gameTemp.updateEntityNames = {};
		$gameTemp.triggerEntities = {};
		$gameTemp.enemies = [];
	}

	maxCameraX() {
		return 9999;
	}

	maxCameraY() {
		return 9999;
	}

	isInvPause() {
		return this.PauseMode === 0;
	}

	isMapPause() {
		return this.PauseMode === 1;
	}

	isExitPause() {
		return this.PauseMode === 2;
	}

	spawnBlock(mineableId, globalTileX, globalTileY) {
		if(SceneManager?._scene?.spawnBlock) {
			SceneManager._scene.spawnBlock(mineableId, globalTileX, globalTileY);
		}
	}

	isGenerated() {
		return !!($dataMap?.meta?.Generated);
	}

	endCurrentlyRunningEvent() {
		if($gameTemp.currentlyRunning?.endEvent) {
			$gameTemp.currentlyRunning.endEvent();
		} else {
			$gameTemp.currentlyRunning = null;
			$gameMap.CameraOffsetY = 0;
			$gameTemp.currentEvent = null;
		}
	}

	setupEvents() {
		PP.Game_Map.setupEvents.apply(this, arguments);

		//this.buildEntities();
	}

	buildEntities() {
		for(const event of this.events()) {
			const data = event.event();
			const m = data.meta;

			if(m.Mineable) {
				const mineableId = parseInt(m.Mineable.trim());
				this.spawnBlock(mineableId, data.x, data.y);

				event.erase();
			}

			if(m.Transfer) {
				const transferData = JSON.parse(m.Transfer.trim());
				if(transferData.length >= 3) {
					const id = transferData[0];
					const x = transferData[1];
					const y = transferData[2];
					const dir = transferData[3] ?? 2;
					const left = transferData[4] ?? 0;
					const right = transferData[5] ?? 0;
					CollisionManager.addTransfer(data.x, data.y, { id, x, y, dir }, left, right);
				}

				event.erase();
			}

			if(m.Trigger && event.meetsConditions(data.pages[0])) {
				const triggerData = JSON.parse(m.Trigger.trim());
				if(triggerData.length > 0) {
					const key = triggerData[0] ?? null;
					const left = triggerData[1] ?? 0;
					const right = triggerData[2] ?? 0;
					const up = triggerData[3] ?? 0;
					const down = triggerData[4] ?? 0;
					CollisionManager.addEventTrigger(data.x, data.y, {
						key: key,
						list: data.pages[0].list
					}, left, right, up, down);
				}

				event.erase();
			}

			if(m.Spikes) {
				const s = new Spikes(data.x, data.y);
				s._name = data.name;
				$gameTemp.updateEntities.push(s);
				$gameTemp.updateEntityNames[s._name] = s;

				event.erase();
			}

			if(m.Enemy) {
				const enemyName = data.name.split(" ")[0];
				if(window[enemyName]) {
					const e = new window[enemyName]((data.x * TS) + 16, (data.y * TS) + 16);
					let code = this.generateCodeString(data);
					if(code) {
						eval(code);
					}
				} else {
					throw "Could not find enemy: " + enemyName;
				}

				event.erase();
			}

			if(m.Crystal) {
				const c = new Crystal(data.x, data.y);
				c._name = data.name;
				$gameTemp.updateEntities.push(c);
				$gameTemp.updateEntityNames[c._name] = c;

				let code = this.generateCodeString(data);
				if(code) {
					c.onHit = new Function(code);
				}

				event.erase();
			}

			if(m.Bed) {
				const i = new Bed(data.x, data.y);
				i._name = data.name;
				$gameTemp.updateEntities.push(i);
				$gameTemp.updateEntityNames[i._name] = i;

				event.erase();
			}

			if(m.Int && event.meetsConditions(data.pages[0])) {
				this.makeEntity(event);
			}

			if(m.TriInt) {
				$gameTemp.triggerEntities[data.name] = event;
				event.erase();
			}
		}
	}

	generateCodeString(data) {
		let code = null;
		if(data.pages.length > 0) {
			const list = data.pages[0].list;
			if(list.length > 0) {
				for(const d of list) {
					if(d.code === 355 || d.code === 655) {
						if(code === null) code = "";
						code += d.parameters.join("\n");
					}
				}
			}
		}
		return code;
	}

	makeEntity(event) {
		const data = event.event();
		const m = data.meta;
		const iData = JSON.parse("[" + (m.Int ?? m.TriInt).trim() + "]");
		const frameCount = (iData[1]);
		const frameSpeed = (iData[2] ?? 15);
		const i = new Interactable(data.x, data.y, event, iData[0], frameCount, frameSpeed, data.pages[0]?.list);
		i.noCameraMove = !!m.NoCameraMove;
		if(m.TeleportIn) {
			i.teleportIn();
		}
		if(m.NoAnimation) {
			i.setNoAnimation();
		}
		i._name = data.name;
		$gameTemp.updateEntities.push(i);
		$gameTemp.updateEntityNames[i._name] = i;

		event.erase();
	}

	triggerEvent(name) {
		if($gameTemp.triggerEntities[name]) {
			const event = $gameTemp.triggerEntities[name];
			this.makeEntity(event);
		}
	}

	clearUpdateEntities() {
		$gameTemp.updateEntities = [];
		$gameTemp.updateEntityNames = {};
		$gameTemp.projectileReactors = null;
		$gameTemp.enemies = [];
	}

	removeEntity(e) {
		$gameTemp.updateEntities.remove(e);
		delete $gameTemp.updateEntityNames[e._name];
	}

	addSpikes(x, y) {
		const name = "Spike_" + x + "_" + y;
		const s = new Spikes(x, y);
		s._name = name;
		s.open();
		$gameTemp.updateEntities.push(s);
		$gameTemp.updateEntityNames[name] = s;
	}

	removeSpikes(x, y) {
		const name = "Spike_" + x + "_" + y;
		const s = $gameTemp.updateEntityNames[name];
		if(s) {
			s.close();
		}
	}

	addRowSpikes(x1, x2, y) {
		for(let x = x1; x <= x2; x++) {
			this.addSpikes(x, y);
		}
	}

	removeRowSpikes(x1, x2, y) {
		for(let x = x1; x <= x2; x++) {
			this.removeSpikes(x, y);
		}
	}

	update() {
		PP.Game_Map.update.apply(this, arguments);

		for(const entity of $gameTemp.updateEntities) {
			entity.update();
		}

		for(const enemy of $gameTemp.enemies) {
			enemy.update();
		}
	}

	addProjectileReactor(entity) {
		if(!$gameTemp.projectileReactors) {
			$gameTemp.projectileReactors = [];
		}
		$gameTemp.projectileReactors.push(entity);
	}

	removeProjectileReactor(entity) {
		if($gameTemp.projectileReactors) {
			$gameTemp.projectileReactors.remove(entity);
		}
	}
}