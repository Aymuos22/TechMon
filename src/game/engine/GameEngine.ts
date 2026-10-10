import { TILE_SIZE } from '../../types/common';
import type { Direction, Position } from '../../types/common';
import type { PlayerState } from '../../types/player';
import type { WorldState, GameSettings } from '../../types/save';
import type { BattleState } from '../../types/battle';
import type { OwnedTechnology } from '../../types/technology';
import { tileDefs } from '../../data/tiles';
import { getMap } from '../../data/cities';
import { getNpcsForMap } from '../../data/npcs';
import { getTechnology } from '../../data/technologies';
import { trainers } from '../../data/cities';
import { GYM_LEADERS } from '../../data/gymConfig';
import { getDialogue } from '../../data/dialogue';
import { GameLoop } from './GameLoop';
import { InputManager, directionDelta } from './InputManager';
import { Camera } from './Camera';
import { Renderer, type RenderActor } from './Renderer';
import { CollisionSystem } from './CollisionSystem';
import { PlayerEntity } from '../entities/Player';
import { NPCEntity } from '../entities/NPC';
import { DialogueEngine } from '../dialogue/DialogueEngine';
import { audioManager } from '../audio/AudioManager';
import { applyXp, createOwnedTechnology, fullHeal } from '../technologies/TechnologyEngine';
import {
  createBattleState,
  advanceToPlayerTurn,
} from '../battle/BattleEngine';
import {
  tryAdvanceQuestByFlag,
  tryAdvanceQuestByTalk,
  tryAdvanceQuestByCollect,
  tryAdvanceQuestByBattle,
  startQuest,
  formatQuestReward,
} from '../quests/QuestEngine';

export type GameMode = 'world' | 'dialogue' | 'battle' | 'menu' | 'transition';

export interface EncounterRequest {
  technologyId: string;
  level: number;
}

export interface GameEngineEvents {
  onPlayerUpdate: (player: PlayerState) => void;
  onWorldUpdate: (world: WorldState) => void;
  onDialogue: (active: boolean) => void;
  onBattleStart: (battle: BattleState) => void;
  onMessage: (text: string) => void;
  onShop: (shopId: string) => void;
  onGymPuzzle: (gymId: string) => void;
  onChallenge: (opts: {
    technologyId: string;
    enemy: OwnedTechnology;
    battle: BattleState;
  }) => void;
  onModeChange: (mode: GameMode) => void;
  onSaveRequest: () => void;
  onHealSequence: () => void;
  onOpenStorage: () => void;
  onBattleTransition: (active: boolean) => void;
}

export class GameEngine {
  readonly input = new InputManager();
  readonly camera = new Camera();
  readonly collision = new CollisionSystem();
  readonly dialogue = new DialogueEngine();
  private loop: GameLoop;
  private renderer: Renderer | null = null;
  private playerEntity: PlayerEntity;
  private npcs: NPCEntity[] = [];
  private mode: GameMode = 'world';
  private player: PlayerState;
  private world: WorldState;
  private settings: GameSettings;
  private events: Partial<GameEngineEvents> = {};
  private encounterCooldown = 0;
  /** Steps after a battle before encounter rolls resume */
  private encounterGraceSteps = 0;
  private dayNightAccum = 0;
  private fadeAlpha = 0;
  private fadeMode: 'none' | 'out' | 'in' = 'none';
  private pendingTeleport: {
    mapId: string;
    x: number;
    y: number;
    facing?: Direction;
  } | null = null;
  private battleFlash = 0;
  private pendingBattle: BattleState | null = null;
  private trainerEngaging = false;
  private trainerApproach: { npc: NPCEntity; trainerId: string } | null = null;
  private pendingTrainerBattleAfterDialogue: string | null = null;

  constructor(
    player: PlayerState,
    world: WorldState,
    settings: GameSettings,
  ) {
    this.player = player;
    this.world = world;
    this.settings = settings;
    this.dialogue.setTextSpeed(settings.textSpeed);
    this.playerEntity = new PlayerEntity(player.position);
    this.playerEntity.direction = player.direction;
    this.loop = new GameLoop((dt) => this.tick(dt));
    this.loadNpcs();
  }

  setEvents(events: Partial<GameEngineEvents>): void {
    this.events = events;
  }

  mount(canvas: HTMLCanvasElement): void {
    this.renderer = new Renderer(canvas);
    this.input.attach();
    this.loop.start();
    const map = getMap(this.player.mapId);
    this.playMapMusic(map.music);
  }

  /** Overworld music: gym maps use city theme so battle BGM only plays in fights */
  private playMapMusic(music: string): void {
    audioManager.playMusic(music === 'battle' ? 'city' : music);
  }

  unmount(): void {
    this.loop.stop();
    this.input.detach();
  }

  getPlayer(): PlayerState {
    return this.player;
  }

  getWorld(): WorldState {
    return this.world;
  }

  setPlayer(player: PlayerState): void {
    this.player = player;
  }

  setWorld(world: WorldState): void {
    this.world = world;
  }

  setSettings(settings: GameSettings): void {
    this.settings = settings;
    this.dialogue.setTextSpeed(settings.textSpeed);
    audioManager.setMusicVolume(settings.musicVolume);
    audioManager.setSfxVolume(settings.sfxVolume);
  }

  getSettings(): GameSettings {
    return this.settings;
  }

  getMode(): GameMode {
    return this.mode;
  }

  setMode(mode: GameMode): void {
    this.mode = mode;
    this.input.setEnabled(mode === 'world' || mode === 'dialogue');
    this.events.onModeChange?.(mode);
  }

  private loadNpcs(): void {
    const defs = getNpcsForMap(this.player.mapId);
    this.npcs = defs.map((d) => {
      if (d.id !== 'ujjwal_blocker' || !this.player.flags.badge_frontend) {
        return new NPCEntity(d);
      }

      return new NPCEntity({
        ...d,
        position: { x: 31, y: 13 },
        direction: 'right',
        dialogueId: 'ujjwal_blocker_cleared',
        interaction: { kind: 'dialogue', dialogueId: 'ujjwal_blocker_cleared' },
      });
    });
  }

  private emitPlayer(): void {
    this.player = {
      ...this.player,
      position: { ...this.playerEntity.tile },
      direction: this.playerEntity.direction,
    };
    this.events.onPlayerUpdate?.(this.player);
  }

  private tick(dt: number): void {
    this.player.playtime += dt;
    this.updateDayNight(dt);

    if (this.mode === 'transition') {
      this.updateTransition(dt);
    } else if (this.mode === 'world') {
      this.updateWorld(dt);
    } else if (this.mode === 'dialogue') {
      this.dialogue.update(dt);
      this.handleDialogueInput();
    }

    this.render();
    this.input.endFrame();
  }

  private updateTransition(dt: number): void {
    if (this.battleFlash > 0) {
      this.battleFlash = Math.max(0, this.battleFlash - dt);
      if (this.battleFlash <= 0 && this.pendingBattle) {
        const battle = this.pendingBattle;
        this.pendingBattle = null;
        this.events.onBattleTransition?.(false);
        this.setMode('battle');
        this.events.onBattleStart?.(battle);
      }
      return;
    }

    if (this.fadeMode === 'out') {
      this.fadeAlpha = Math.min(1, this.fadeAlpha + dt * 3.2);
      if (this.fadeAlpha >= 1 && this.pendingTeleport) {
        this.applyTeleport(
          this.pendingTeleport.mapId,
          this.pendingTeleport.x,
          this.pendingTeleport.y,
          this.pendingTeleport.facing,
        );
        this.pendingTeleport = null;
        this.fadeMode = 'in';
      }
    } else if (this.fadeMode === 'in') {
      this.fadeAlpha = Math.max(0, this.fadeAlpha - dt * 3.2);
      if (this.fadeAlpha <= 0) {
        this.fadeMode = 'none';
        this.setMode('world');
      }
    } else {
      this.setMode('world');
    }
  }

  private updateDayNight(dt: number): void {
    this.dayNightAccum += dt;
    this.world.dayNightMs += dt * 1000;
    // Full day/night cycle ~8 minutes real time
    const cycle = 8 * 60 * 1000;
    const phase = this.world.dayNightMs % cycle;
    const wasNight = this.world.isNight;
    this.world.isNight = phase > cycle * 0.55;
    if (wasNight !== this.world.isNight && this.dayNightAccum > 1) {
      this.events.onWorldUpdate?.(this.world);
    }
  }

  private updateWorld(dt: number): void {
    const map = getMap(this.player.mapId);
    this.encounterCooldown = Math.max(0, this.encounterCooldown - dt);
    this.camera.update(dt);

    if (this.input.consumeJustPressed('menu')) {
      // setMode freezes overworld updates + disables movement input
      this.setMode('menu');
      audioManager.playSfx('menu');
      return;
    }
    // Cancel does nothing on the overworld (menus handle B/cancel)

    if (this.input.consumeJustPressed('confirm')) {
      this.tryInteract();
    }

    if (this.trainerEngaging) {
      this.playerEntity.update(dt);
      this.updateTrainerApproach(dt, map);
      this.camera.follow(
        this.playerEntity.pixelX,
        this.playerEntity.pixelY,
        map.width * TILE_SIZE,
        map.height * TILE_SIZE,
      );
      return;
    }

    const dir = this.input.getDirection();
    if (dir && !this.playerEntity.moving) {
      const occupied = this.npcs.map((n) => n.tile);
      const moved = this.playerEntity.tryStartMove(dir, (x, y) =>
        !this.collision.blocksEntity(map, x, y, occupied),
      );
      if (!moved) {
        this.playerEntity.direction = dir;
      }
    }

    const arrived = this.playerEntity.update(dt);
    this.emitPlayer();

    for (const npc of this.npcs) {
      const occupied = [
        this.playerEntity.tile,
        ...this.npcs.filter((n) => n !== npc).map((n) => n.tile),
      ];
      npc.update(
        dt,
        (x, y) => !this.collision.blocksEntity(map, x, y, occupied, npc.tile),
        this.world.isNight,
      );
    }

    this.camera.follow(
      this.playerEntity.pixelX,
      this.playerEntity.pixelY,
      map.width * TILE_SIZE,
      map.height * TILE_SIZE,
    );

    this.checkTrainerSight();

    if (arrived) {
      this.checkTransition();
      if (this.encounterGraceSteps > 0) {
        this.encounterGraceSteps -= 1;
      } else {
        this.checkEncounter();
      }
    }
  }

  private checkTrainerSight(): void {
    if (this.trainerEngaging || this.playerEntity.moving) return;
    if (!this.hasBattleReadyTech()) return;
    const map = getMap(this.player.mapId);
    const playerTile = this.playerEntity.tile;

    for (const npc of this.npcs) {
      const interaction = npc.def.interaction;
      if (interaction?.kind !== 'trainer') continue;
      if (this.world.defeatedTrainers.includes(interaction.trainerId)) continue;
      const range = npc.def.sightRange ?? 0;
      if (range <= 0) continue;

      const d = directionDelta(npc.direction);
      let spotted = false;
      for (let i = 1; i <= range; i++) {
        const x = npc.tile.x + d.x * i;
        const y = npc.tile.y + d.y * i;
        if (x === playerTile.x && y === playerTile.y) {
          spotted = true;
          break;
        }
        if (!this.collision.isWalkable(map, x, y)) break;
      }

      if (spotted) {
        this.trainerEngaging = true;
        npc.direction = opposite(this.playerEntity.direction);
        this.playerEntity.direction = opposite(npc.direction);
        this.emitPlayer();
        this.events.onMessage?.(`${npc.def.name} wants to battle!`);
        this.trainerApproach = { npc, trainerId: interaction.trainerId };
        return;
      }
    }
  }

  private updateTrainerApproach(dt: number, map: ReturnType<typeof getMap>): void {
    const approach = this.trainerApproach;
    if (!approach) return;

    const { npc, trainerId } = approach;
    if (npc.moving) {
      npc.update(dt, () => true, this.world.isNight);
      return;
    }

    const dx = this.playerEntity.tile.x - npc.tile.x;
    const dy = this.playerEntity.tile.y - npc.tile.y;
    const distance = Math.abs(dx) + Math.abs(dy);
    if (distance <= 1) {
      npc.direction = opposite(this.playerEntity.direction);
      this.playerEntity.direction = opposite(npc.direction);
      this.trainerApproach = null;
      this.emitPlayer();
      this.startTrainerChallengeDialogue(npc, trainerId);
      return;
    }

    let dir: Direction;
    if (Math.abs(dx) >= Math.abs(dy)) {
      dir = dx > 0 ? 'right' : 'left';
    } else {
      dir = dy > 0 ? 'down' : 'up';
    }
    const occupied = [
      this.playerEntity.tile,
      ...this.npcs.filter((other) => other !== npc).map((other) => other.tile),
    ];
    const moved = npc.tryStep(
      dir,
      (x, y) => !this.collision.blocksEntity(map, x, y, occupied, npc.tile),
    );
    if (!moved) {
      this.trainerApproach = null;
      this.startTrainerChallengeDialogue(npc, trainerId);
    }
  }

  private tryInteract(): void {
    const facing = this.playerEntity.facingTile();
    const map = getMap(this.player.mapId);
    const dirs: Record<string, { x: number; y: number }> = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };
    const d = dirs[this.playerEntity.direction];

    // 1. NPC (including through a counter — FireRed desk talk)
    const npc =
      this.npcs.find((n) => n.tile.x === facing.x && n.tile.y === facing.y) ??
      (() => {
        const facingKind = tileDefs[map.tiles[facing.y]?.[facing.x]]?.kind;
        if (facingKind !== 'counter') return undefined;
        const beyond = { x: facing.x + d.x, y: facing.y + d.y };
        return this.npcs.find((n) => n.tile.x === beyond.x && n.tile.y === beyond.y);
      })();
    if (npc) {
      audioManager.playSfx('interact');
      this.interactNpc(npc);
      return;
    }

    // 2. Door / warp (face + A)
    const doorWarp = map.transitions.find(
      (tr) => tr.from.x === facing.x && tr.from.y === facing.y && !tr.interactOnly,
    );
    const facingKind = tileDefs[map.tiles[facing.y]?.[facing.x]]?.kind;
    if (doorWarp && (facingKind === 'door' || doorWarp.id.includes('to_'))) {
      // Prefer building doors via A; route edges still work via walk-on
      if (facingKind === 'door') {
        audioManager.playSfx('interact');
        this.tryWarp(doorWarp);
        return;
      }
    }

    // 3. Signs / items / objects
    const point = map.interactions.find(
      (i) => i.position.x === facing.x && i.position.y === facing.y,
    );
    if (point) {
      audioManager.playSfx('interact');
      this.interactPoint(point.id);
      return;
    }

    // 4. Sign tile without interaction entry
    if (facingKind === 'sign') {
      this.showSign('...');
    }
  }

  private interactNpc(npc: NPCEntity): void {
    const def = npc.def;
    npc.direction = opposite(this.playerEntity.direction);

    // Quest talk advance (e.g. Missing API restart step with Nurse Byte)
    const talkResult = tryAdvanceQuestByTalk(this.player, def.id);
    const talkAdvanced =
      talkResult.player !== this.player || talkResult.questCompleted;
    if (talkAdvanced) {
      this.applyQuestResult(talkResult);
      if (!talkResult.questCompleted) {
        this.events.onMessage?.('Quest progress updated.');
      }
    }

    if (def.id === 'professor_ada' && this.player.flags.starter_chosen) {
      this.startDialogue('professor_ada', 'ada_after');
      return;
    }

    if (def.id === 'layoff_guide' && this.player.flags.game_cleared) {
      this.startDialogue('layoff_guide_cleared');
      return;
    }

    if (def.id === 'yc_partner' && this.player.flags.yc_backed) {
      this.startDialogue('yc_partner_backed');
      return;
    }

    if (def.interaction?.kind === 'quest_giver') {
      // Turn-in talk already handled above
      if (talkAdvanced) return;
      const qid = def.interaction.questId;
      if (this.player.completedQuests.includes(qid)) {
        this.events.onMessage?.(
          `${def.name}: Side quest already cleared. Go touch grass — or tall grass.`,
        );
        return;
      }
      if (this.player.activeQuests.some((q) => q.questId === qid)) {
        this.events.onMessage?.(
          `${def.name}: Check your Quest menu for the next step.`,
        );
        return;
      }
      this.startDialogue(def.dialogueId);
      return;
    }

    if (def.interaction?.kind === 'shop') {
      this.startDialogue(def.dialogueId);
      return;
    }

    if (def.interaction?.kind === 'heal') {
      this.startDialogue(def.dialogueId);
      return;
    }

    if (def.interaction?.kind === 'trainer') {
      if (this.world.defeatedTrainers.includes(def.interaction.trainerId)) {
        this.events.onMessage?.(`${def.name}: Nice battle earlier! Keep coding.`);
        return;
      }
      if (!this.hasBattleReadyTech()) {
        this.events.onMessage?.('You need a battle-ready technology first! Visit Professor Ada.');
        return;
      }
      this.trainerEngaging = true;
      this.startTrainerChallengeDialogue(npc, def.interaction.trainerId);
      return;
    }

    if (def.interaction?.kind === 'gym_leader') {
      const gymId = def.interaction.gymId;
      const cfg = GYM_LEADERS[gymId];
      const trainerId = cfg?.trainerId ?? 'gym_maya';
      const badgeId = cfg?.badgeId ?? gymId;
      const winNode = cfg?.winNodeId ?? 'maya_win';
      // Recover badge if leader was beaten but win dialogue never ran
      if (
        this.world.defeatedTrainers.includes(trainerId) &&
        !this.player.badges.includes(badgeId)
      ) {
        this.startDialogue(def.dialogueId, winNode);
        return;
      }
      if (this.world.defeatedTrainers.includes(trainerId)) {
        this.events.onMessage?.(
          `${def.name}: That badge looks good on you. Keep shipping!`,
        );
        return;
      }
      if (!this.hasBattleReadyTech()) {
        this.events.onMessage?.('You need a battle-ready technology first! Visit Professor Ada.');
        return;
      }
      const remainingTrainerId = cfg?.requiredTrainerIds?.find(
        (id) => !this.world.defeatedTrainers.includes(id),
      );
      if (remainingTrainerId) {
        this.events.onMessage?.(
          `${def.name}: Challenge every gym trainer before facing me.`,
        );
        return;
      }
      this.startDialogue(def.dialogueId);
      return;
    }

    this.startDialogue(def.dialogueId);
  }

  private interactPoint(pointId: string): void {
    const map = getMap(this.player.mapId);
    const point = map.interactions.find((i) => i.id === pointId);
    if (!point) return;

    if (point.kind === 'save') {
      this.startDialogue('computer_save');
      return;
    }
    if (point.kind === 'computer') {
      // Tech Storage terminals (Code Center PC)
      if (
        this.player.mapId === 'code_center' ||
        this.player.mapId === 'farm_hut' ||
        point.id === 'storage_pc' ||
        point.id === 'farm_pc'
      ) {
        this.events.onOpenStorage?.();
        return;
      }
      // Home PC = save
      if (point.id === 'computer' || point.id === 'save_pc') {
        this.startDialogue('computer_save');
        return;
      }
      this.showSign(point.text ?? 'The terminal hums quietly.', 'Terminal');
      return;
    }
    if (point.kind === 'sign' || point.kind === 'info') {
      this.showSign(point.text ?? '...');
      return;
    }
    if (point.kind === 'bed') {
      this.startDialogue('bed_rest');
      return;
    }
    if (point.kind === 'chest') {
      if (point.flag && this.world.openedChests.includes(point.flag)) {
        this.events.onMessage?.('The chest is empty.');
        return;
      }
      if (point.itemId) {
        this.addItem(point.itemId, 1);
        if (point.flag) {
          this.world = {
            ...this.world,
            openedChests: [...this.world.openedChests, point.flag],
            collectedItems: [...(this.world.collectedItems ?? []), point.flag],
          };
          this.events.onWorldUpdate?.(this.world);
          const collectResult = tryAdvanceQuestByCollect(this.player, point.flag);
          if (collectResult.player !== this.player || collectResult.questCompleted) {
            this.applyQuestResult(collectResult);
            if (!collectResult.questCompleted) {
              this.events.onMessage?.('Quest progress updated.');
            }
          }
        }
        this.showSign(`You found a ${point.itemId.replace(/_/g, ' ')}!`, 'Item');
      }
      return;
    }
    if (point.kind === 'bug') {
      if (point.flag && this.world.foundBugs.includes(point.flag)) {
        this.events.onMessage?.('Already squashed this bug.');
        return;
      }
      if (point.flag) {
        this.world = {
          ...this.world,
          foundBugs: [...this.world.foundBugs, point.flag],
        };
        this.player = {
          ...this.player,
          flags: { ...this.player.flags, [point.flag]: true },
        };
        const result = tryAdvanceQuestByFlag(this.player, point.flag);
        this.applyQuestResult(result);
        this.events.onWorldUpdate?.(this.world);
        this.events.onMessage?.('Found a hidden bug! Squashed.');
      }
      return;
    }
    if (point.kind === 'inspect') {
      if (point.flag) {
        this.player = {
          ...this.player,
          flags: { ...this.player.flags, [point.flag]: true },
        };
      }
      // Match quest steps by interaction id (e.g. route_logs) or flag id
      let result = tryAdvanceQuestByFlag(this.player, point.id);
      if (result.player === this.player && point.flag) {
        result = tryAdvanceQuestByFlag(this.player, point.flag);
      }
      if (result.player !== this.player || result.questCompleted) {
        this.applyQuestResult(result);
        if (!result.questCompleted) {
          this.events.onMessage?.('Quest progress updated.');
        }
      }
      this.showSign(point.text ?? 'Nothing interesting.', 'Inspect');
      return;
    }
    if (point.text) {
      this.showSign(point.text);
    }
  }

  private applyQuestResult(result: ReturnType<typeof tryAdvanceQuestByFlag>): void {
    this.player = result.player;
    for (const item of result.rewardItems) {
      this.addItem(item.itemId, item.quantity);
    }
    if (result.questCompleted) {
      const loot = formatQuestReward(result);
      this.events.onMessage?.(`Quest complete! Reward: ${loot}`);
      if (result.rewardXp > 0 && this.player.party.length > 0) {
        const lead = this.player.party[0];
        const xpResult = applyXp(lead, result.rewardXp);
        this.player = {
          ...this.player,
          party: [xpResult.tech, ...this.player.party.slice(1)],
        };
        if (xpResult.leveled) {
          this.events.onMessage?.(
            `LEVEL UP! ${getTechnology(xpResult.tech.definitionId).name} → Lv${xpResult.newLevel}`,
          );
        }
      }
    }
    this.emitPlayer();
  }

  addItem(itemId: string, quantity: number): void {
    const inv = [...this.player.inventory];
    const existing = inv.find((i) => i.itemId === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      inv.push({ itemId, quantity });
    }
    this.player = { ...this.player, inventory: inv };
    this.emitPlayer();
  }

  startDialogue(dialogueId: string, nodeId?: string): void {
    this.dialogue.start(dialogueId, nodeId);
    this.setMode('dialogue');
    this.events.onDialogue?.(true);
  }

  private startTrainerChallengeDialogue(npc: NPCEntity, trainerId: string): void {
    const opening = getDialogue(npc.def.dialogueId)[0];
    this.pendingTrainerBattleAfterDialogue = trainerId;
    this.dialogue.startEphemeral(opening.speaker || npc.def.name, opening.text);
    this.setMode('dialogue');
    this.events.onDialogue?.(true);
  }

  private handleDialogueInput(): void {
    if (this.dialogue.hasChoices()) {
      if (this.input.consumeJustPressed('up')) this.dialogue.moveChoice(-1);
      if (this.input.consumeJustPressed('down')) this.dialogue.moveChoice(1);
    }
    if (this.input.consumeJustPressed('confirm')) {
      const result = this.dialogue.advance();
      let keepUi = false;
      if (result.action) {
        if (
          result.action.kind === 'open_shop' ||
          result.action.kind === 'open_gym_puzzle' ||
          result.action.kind === 'start_battle'
        ) {
          keepUi = true;
        }
        this.handleDialogueAction(result.action);
      }
      if (result.done && !keepUi) {
        const trainerId = this.pendingTrainerBattleAfterDialogue;
        if (trainerId) {
          this.pendingTrainerBattleAfterDialogue = null;
          this.dialogue.end();
          this.events.onDialogue?.(false);
          this.beginTrainerBattle(trainerId);
          return;
        }
        this.trainerEngaging = false;
        this.setMode('world');
        this.events.onDialogue?.(false);
      } else if (result.done && keepUi) {
        this.dialogue.end();
        this.events.onDialogue?.(false);
      }
    }
  }

  private handleDialogueAction(action: import('../../types/dialogue').DialogueAction): void {
    switch (action.kind) {
      case 'give_starter': {
        if (this.player.flags.starter_chosen) break;
        const techId = action.technologyIds[0];
        const tech = createOwnedTechnology(techId, 5);
        const techDex = { ...this.player.techDex };
        techDex[techId] = { discovered: true, registered: true, timesEncountered: 1 };
        this.player = {
          ...this.player,
          party: [...this.player.party, tech],
          techDex,
          flags: { ...this.player.flags, starter_chosen: true },
        };
        this.emitPlayer();
        this.events.onMessage?.(`${getTechnology(techId).name} joined your party!`);
        break;
      }
      case 'give_item': {
        this.addItem(action.itemId, action.quantity);
        this.events.onMessage?.(`Received ${action.itemId.replace(/_/g, ' ')}!`);
        break;
      }
      case 'give_money': {
        this.player = {
          ...this.player,
          money: this.player.money + action.amount,
        };
        this.emitPlayer();
        this.events.onMessage?.(`Received ₿${action.amount.toLocaleString()}!`);
        break;
      }
      case 'give_technology': {
        const tech = createOwnedTechnology(action.technologyId, action.level);
        const techDex = { ...this.player.techDex };
        const entry = techDex[action.technologyId] ?? {
          discovered: false,
          registered: false,
          timesEncountered: 0,
        };
        techDex[action.technologyId] = {
          ...entry,
          discovered: true,
          registered: true,
          timesEncountered: entry.timesEncountered + 1,
        };
        const name = getTechnology(action.technologyId).name;
        if (this.player.party.length < 6) {
          this.player = {
            ...this.player,
            party: [...this.player.party, tech],
            techDex,
          };
          this.events.onMessage?.(`${name} (Lv${action.level}) joined your party!`);
        } else {
          this.player = {
            ...this.player,
            storage: [...this.player.storage, tech],
            techDex,
          };
          this.events.onMessage?.(`${name} (Lv${action.level}) sent to Tech Storage!`);
        }
        this.emitPlayer();
        break;
      }
      case 'heal_party': {
        // Visual heal sequence in React; HP/EP restored after animation
        this.events.onHealSequence?.();
        break;
      }
      case 'open_shop': {
        this.events.onShop?.(action.shopId);
        break;
      }
      case 'start_battle': {
        if (this.hasBattleReadyTech()) {
          this.beginTrainerBattle(action.trainerId);
        } else {
          this.events.onMessage?.('You need a battle-ready technology first! Visit Professor Ada.');
          this.trainerEngaging = false;
        }
        break;
      }
      case 'start_quest': {
        this.player = startQuest(this.player, action.questId);
        this.emitPlayer();
        this.events.onMessage?.('Quest started!');
        break;
      }
      case 'give_badge': {
        if (!this.player.badges.includes(action.badgeId)) {
          this.player = {
            ...this.player,
            badges: [...this.player.badges, action.badgeId],
            flags: { ...this.player.flags, [`badge_${action.badgeId}`]: true },
            achievements: [...this.player.achievements, `badge_${action.badgeId}`],
          };
          this.emitPlayer();
          this.events.onMessage?.(`Earned the ${action.badgeId} badge!`);
        }
        break;
      }
      case 'set_flag': {
        const flags = { ...this.player.flags, [action.flag]: action.value };
        let achievements = this.player.achievements;
        if (flags.defeated_dario && flags.defeated_sam && !flags.game_cleared) {
          flags.game_cleared = true;
          achievements = [
            ...new Set([...achievements, 'game_cleared', 'farm_life_unlocked']),
          ];
          this.events.onMessage?.(
            'Both disruptors down! Quiet Acre Farming Life unlocked — north portal.',
          );
        }
        this.player = { ...this.player, flags, achievements };
        this.emitPlayer();
        break;
      }
      case 'open_gym_puzzle': {
        this.events.onGymPuzzle?.(action.gymId);
        break;
      }
      case 'save_game': {
        this.events.onSaveRequest?.();
        break;
      }
      case 'teleport': {
        this.teleport(action.mapId, action.x, action.y);
        break;
      }
      default:
        break;
    }
  }

  private hasBattleReadyTech(): boolean {
    return this.player.party.some((technology) => technology.currentHp > 0);
  }

  beginTrainerBattle(trainerId: string): void {
    const trainer = trainers[trainerId];
    if (!trainer) return;
    if (!this.hasBattleReadyTech()) {
      this.events.onMessage?.('You have no battle-ready technologies!');
      this.trainerEngaging = false;
      return;
    }
    const lead = trainer.party[0];
    const enemy = createOwnedTechnology(lead.technologyId, lead.level);
    const battle = createBattleState({
      playerParty: this.player.party,
      enemy,
      isWild: false,
      canEscape: false,
      isGym: trainer.isGym,
      trainerName: trainer.name,
      xpReward: lead.level * 10,
      moneyReward: trainer.rewardMoney,
    });
    battle.trainerId = trainerId;
    battle.trainerPartyIndex = 0;
    this.startBattleWithTransition(advanceToPlayerTurn(battle));
  }

  beginWildBattle(technologyId: string, level: number): void {
    if (!this.hasBattleReadyTech()) {
      this.events.onMessage?.('You need a technology first! Visit Professor Ada.');
      return;
    }
    const enemy = createOwnedTechnology(technologyId, level);
    const techDex = { ...this.player.techDex };
    const entry = techDex[technologyId] ?? {
      discovered: false,
      registered: false,
      timesEncountered: 0,
    };
    techDex[technologyId] = {
      ...entry,
      discovered: true,
      timesEncountered: entry.timesEncountered + 1,
    };
    this.player = { ...this.player, techDex };
    this.emitPlayer();

    const battle = createBattleState({
      playerParty: this.player.party,
      enemy,
      isWild: true,
      canEscape: true,
      xpReward: level * 8 * (this.player.xpBoosterBattles > 0 ? 2 : 1),
    });

    this.startBattleWithTransition(advanceToPlayerTurn(battle));
  }

  private startBattleWithTransition(battle: BattleState): void {
    audioManager.playSfx('battle');
    audioManager.playMusic('battle');
    this.pendingBattle = battle;
    this.battleFlash = 0.55;
    this.setMode('transition');
    this.events.onBattleTransition?.(true);
  }

  private checkTransition(): void {
    const map = getMap(this.player.mapId);
    const t = map.transitions.find(
      (tr) =>
        tr.from.x === this.playerEntity.tile.x &&
        tr.from.y === this.playerEntity.tile.y &&
        !tr.interactOnly,
    );
    if (!t) return;
    this.tryWarp(t);
  }

  private tryWarp(t: import('../../types/map').MapTransition): void {
    const missingRequiredFlag = t.requiresFlag && !this.player.flags[t.requiresFlag];
    const missingRequiredFlags =
      t.requiresAllFlags?.some((flag) => !this.player.flags[flag]) ?? false;

    if (missingRequiredFlag || missingRequiredFlags) {
      const back = opposite(this.playerEntity.direction);
      const d = directionDelta(back);
      this.playerEntity.setTile({
        x: this.playerEntity.tile.x + d.x,
        y: this.playerEntity.tile.y + d.y,
      });
      this.showSign(t.message ?? 'You cannot go this way yet.', 'System');
      this.emitPlayer();
      return;
    }
    this.teleport(t.toMapId, t.toPosition.x, t.toPosition.y, t.toFacing);
  }

  teleport(mapId: string, x: number, y: number, facing?: Direction): void {
    if (this.fadeMode !== 'none' || this.mode === 'transition') {
      this.applyTeleport(mapId, x, y, facing);
      this.fadeMode = 'in';
      this.fadeAlpha = 1;
      this.setMode('transition');
      return;
    }
    this.pendingTeleport = { mapId, x, y, facing };
    this.fadeMode = 'out';
    this.fadeAlpha = 0;
    this.setMode('transition');
  }

  private applyTeleport(mapId: string, x: number, y: number, facing?: Direction): void {
    this.player = { ...this.player, mapId };
    this.playerEntity.setTile({ x, y });
    if (facing) {
      this.playerEntity.direction = facing;
    }
    this.loadNpcs();
    const map = getMap(mapId);
    this.camera.follow(
      this.playerEntity.pixelX,
      this.playerEntity.pixelY,
      map.width * TILE_SIZE,
      map.height * TILE_SIZE,
    );
    this.playMapMusic(map.music);
    this.emitPlayer();
  }

  /** Instant heal used after Code Center animation */
  healPartyFully(): void {
    this.player = {
      ...this.player,
      party: this.player.party.map((t) => fullHeal(t)),
    };
    this.emitPlayer();
  }

  showSign(text: string, speaker = 'Sign'): void {
    this.dialogue.startEphemeral(speaker, text);
    this.setMode('dialogue');
    this.events.onDialogue?.(true);
  }

  clearTrainerEngaging(): void {
    this.trainerEngaging = false;
  }

  private checkEncounter(): void {
    if (this.encounterCooldown > 0) return;
    if (!this.hasBattleReadyTech()) return;
    const map = getMap(this.player.mapId);
    if (!map.encounters) return;
    if (!this.collision.isEncounterTile(map, this.playerEntity.tile.x, this.playerEntity.tile.y)) {
      return;
    }
    if (Math.random() > map.encounters.chance) return;

    const entries = map.encounters.entries.filter((e) => {
      if (e.nightOnly && !this.world.isNight) return false;
      if (e.dayOnly && this.world.isNight) return false;
      return true;
    });
    if (entries.length === 0) return;

    const total = entries.reduce((s, e) => s + e.weight, 0);
    let roll = Math.random() * total;
    let chosen = entries[0];
    for (const e of entries) {
      roll -= e.weight;
      if (roll <= 0) {
        chosen = e;
        break;
      }
    }
    const level =
      chosen.minLevel + Math.floor(Math.random() * (chosen.maxLevel - chosen.minLevel + 1));
    this.encounterCooldown = 2.0;
    this.encounterGraceSteps = 5;
    this.beginWildBattle(chosen.technologyId, level);
  }

  private render(): void {
    if (!this.renderer) return;
    const map = getMap(this.player.mapId);
    this.renderer.update(0.016);
    this.renderer.clear();
    // Ground + objects
    this.renderer.renderMap(map, this.camera, this.world.isNight, 'base');

    const actors: RenderActor[] = [
      {
        x: this.playerEntity.tile.x,
        y: this.playerEntity.tile.y,
        pixelX: Math.round(this.playerEntity.pixelX),
        pixelY: Math.round(this.playerEntity.pixelY),
        direction: this.playerEntity.direction,
        color: '#1fa87a',
        walkFrame: this.playerEntity.moving ? this.playerEntity.walkFrame : 0,
        isPlayer: true,
      },
      ...this.npcs.map((n) => ({
        x: n.tile.x,
        y: n.tile.y,
        pixelX: Math.round(n.pixelX),
        pixelY: Math.round(n.pixelY),
        direction: n.direction,
        color: n.def.color,
        gender: n.def.gender,
        name: n.def.name,
        walkFrame: n.moving ? n.walkFrame : 0,
      })),
    ];
    // Characters (Y-sorted)
    this.renderer.renderActors(actors, this.camera);
    // Tree canopies / roofs in front
    this.renderer.renderMap(map, this.camera, this.world.isNight, 'foreground');
    this.renderer.renderLocationLabel(map.name);

    if (this.battleFlash > 0) {
      this.renderer.renderBattleFlash(1 - this.battleFlash / 0.55);
    }
    if (this.fadeAlpha > 0) {
      this.renderer.renderFade(this.fadeAlpha);
    }
  }

  /** Called from React when battle ends */
  onBattleEnd(result: {
    party: OwnedTechnology[];
    won: boolean;
    money: number;
    trainerId?: string;
    registeredId?: string;
    escaped?: boolean;
  }): void {
    this.player = {
      ...this.player,
      party: result.party,
      money: this.player.money + result.money,
      xpBoosterBattles: Math.max(0, this.player.xpBoosterBattles - 1),
    };

    if (result.registeredId) {
      const techDex = { ...this.player.techDex };
      techDex[result.registeredId] = {
        ...(techDex[result.registeredId] ?? {
          discovered: true,
          registered: false,
          timesEncountered: 1,
        }),
        discovered: true,
        registered: true,
      };
      this.player = { ...this.player, techDex };
    }

    if (result.won && result.trainerId) {
      this.world = {
        ...this.world,
        defeatedTrainers: [...new Set([...this.world.defeatedTrainers, result.trainerId])],
      };
      this.events.onWorldUpdate?.(this.world);

      const battleQuest = tryAdvanceQuestByBattle(this.player, result.trainerId);
      if (battleQuest.player !== this.player || battleQuest.questCompleted) {
        this.applyQuestResult(battleQuest);
        if (!battleQuest.questCompleted) {
          this.events.onMessage?.('Quest progress updated.');
        }
      }

      const trainer = trainers[result.trainerId];
      if (trainer?.winDialogueId) {
        this.trainerEngaging = false;
        this.emitPlayer();
        const map = getMap(this.player.mapId);
        this.playMapMusic(map.music);
        const treeId =
          trainer.winDialogueTreeId ??
          (trainer.winDialogueId.startsWith('maya')
            ? 'maya_intro'
            : trainer.winDialogueId.startsWith('arjun')
              ? 'arjun_intro'
              : trainer.winDialogueId);
        // Leave battle mode before opening dialogue so input + UI unlock
        this.setMode('world');
        this.startDialogue(treeId, trainer.winDialogueId);
        return;
      }
    }

    this.trainerEngaging = false;

    // Escape returns to the world with current HP — not a blackout
    if (result.escaped) {
      const map = getMap(this.player.mapId);
      this.playMapMusic(map.music);
      this.setMode('world');
      this.events.onMessage?.('Got away safely!');
      this.emitPlayer();
      return;
    }

    if (!result.won) {
      // Black out — heal and send to code center
      this.player = {
        ...this.player,
        party: this.player.party.map((t) => fullHeal(t)),
        money: Math.max(0, this.player.money - Math.floor(this.player.money * 0.1)),
      };
      this.events.onMessage?.(
        'Your technologies have crashed. Returning to the nearest Code Center...',
      );
      this.teleport('code_center', 7, 7);
    } else {
      const map = getMap(this.player.mapId);
      this.playMapMusic(map.music);
      this.setMode('world');
    }
    this.emitPlayer();
  }

  getDialogueEngine(): DialogueEngine {
    return this.dialogue;
  }

  getNpcAt(pos: Position): NPCEntity | undefined {
    return this.npcs.find((n) => n.tile.x === pos.x && n.tile.y === pos.y);
  }

  forceMessage(text: string): void {
    this.events.onMessage?.(text);
  }
}

function opposite(dir: Direction): Direction {
  switch (dir) {
    case 'up':
      return 'down';
    case 'down':
      return 'up';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
  }
}
